import nodemailer from "../lib/nodemailer.js";
import Campaign from "../models/campaign.model.js";
import User from "../models/user.model.js";
import NotificationLog from "../models/notification.model.js";
import Registration from "../models/registration.model.js";
import Payment from "../models/payment.model.js";

// Create and export new campaign(s) (supports both single and multiple objects)
export const createCampaign = async (req, res) => {
  try {
    const campaignData = req.body;

    // If req.body is an array, insert multiple campaigns; otherwise, insert a single campaign
    if (Array.isArray(campaignData)) {
      if (campaignData.length === 0) {
        return res.status(400).json({ message: "Empty array. No campaigns to create." });
      }

      // Use insertMany for multiple campaigns
      const result = await Campaign.insertMany(campaignData);

      try {
        // Get all users with role 'volunteer'
        const volunteers = await User.find({ role: "volunteer" });

        if (volunteers.length === 0) {
          console.log("No volunteers found to notify.");
          return res
            .status(201)
            .json({ message: "Campaigns created successfully", campaigns: result });
        }

        // Email sending logic
        const emailPromises = volunteers.map(async (volunteer) => {
          await nodemailer.newCampaignEmail(volunteer); // Ensure this method is defined in your nodemailer config
          console.log(`Email sent to ${volunteer.email}`);
        });

        // Wait for all email promises to resolve
        await Promise.all(emailPromises);

        // All emails sent successfully
        res.status(201).json({
          message: "Campaigns created successfully and notifications sent.",
          campaigns: result,
        });
      } catch (error) {
        console.error("Error sending email notifications:", error.message);
        res.status(500).json({
          message: "Campaigns created, but error occurred while sending notifications.",
          campaigns: result,
        });
      }
    } else {
      // Handle single campaign object
      const campaign = new Campaign(campaignData);
      const result = await campaign.save();

      // Send email notifications for a single campaign
      // try {
      const volunteers = await User.find({ role: "volunteer" });

      if (volunteers.length === 0) {
        console.log("No volunteers found to notify.");
        return res.status(201).json({ message: "Campaign created successfully", campaign: result });
      }

      const emailPromises = volunteers.map(async (volunteer) => {
        await nodemailer.newCampaignEmail(volunteer); // Ensure this method is defined in your nodemailer config
        console.log(`Email sent to ${volunteer.email}`);
        // Log the notification for each volunteer
        await NotificationLog.create({
          email: volunteer.email,
          campaign: result._id, // Assuming result._id is the campaign ID
          notificationType: "CampaignCreated",
          sentAt: new Date(),
          status: "Sent",
        });
      });

      await Promise.all(emailPromises);
      res.status(201).json({
        message: "Campaign created successfully and notifications sent.",
        campaign: result,
      });
      // } catch (error) {
      //   console.error("Error sending email notifications:", error.message);
      //   res.status(500).json({
      //     message: "Campaign created, but error occurred while sending notifications.",
      //     campaign: result,
      //   });
      // }
    }
  } catch (error) {
    res.status(500).json({ message: "Error creating campaign(s)", error: error.message });
  }
};

export const getAllCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find();

    res.status(200).json({ results: campaigns });
  } catch (error) {
    res.status(500).json({ message: "Error fetching campaigns", error });
  }
};

// Get all paginated campaigns
export const getPaginatedCampaigns = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  // Remove pagination parameters from query to use remaining ones as filters
  const filters = { ...req.query };
  delete filters.page;
  delete filters.limit;

  // Set default filter for isActive if not specified in the query
  if (filters.isActive === undefined) {
    filters.isActive = true;
  }

  try {
    // Apply dynamic filters to the database query
    const campaigns = await Campaign.find(filters)
      .skip((page - 1) * limit)
      .limit(limit);

    const totalItems = await Campaign.countDocuments(filters);

    res.status(200).json({
      results: campaigns,
      metadata: {
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching campaigns", error });
  }
};

export const getCampaginById = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch data in parallel
    const [campaign, registrations, donations] = await Promise.all([
      Campaign.findById(id),
      Registration.find({ campaign: id }).populate("volunteer"),
      Payment.find({ campaign: id }).populate("userId"),
    ]);

    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    // Spread campaign data and include registrations and donations
    const response = {
      ...campaign.toObject(), // Convert Mongoose document to plain object
      registrations,
      donations,
    };

    res.status(200).json({ results: response });
  } catch (error) {
    res.status(500).json({ message: "Error fetching campaign data", error });
  }
};

// Update a campaign
export const updateCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findByIdAndUpdate(req.params.id, req.body, { new: true });

    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    res.status(200).json({ message: "Campaign updated successfully", campaign });
  } catch (error) {
    res.status(500).json({ message: "Error updating campaign", error });
  }
};

export const register = async (req, res) => {
  const { volunteer } = req.body;

  try {
    // Check if the campaign ID is provided
    if (!req.params.id) {
      return res.status(400).json({ message: "Campaign ID is required" });
    }

    // Check if the volunteer ID is provided
    if (!volunteer) {
      return res.status(400).json({ message: "Volunteer ID is required" });
    }

    // Create a new registration instance
    const newRegistration = new Registration({
      campaign: req.params.id,
      volunteer,
    });

    let savedRegistration;
    try {
      // Save registration to the database
      savedRegistration = await newRegistration.save();
    } catch (err) {
      return res.status(500).json({
        message: "Error saving registration to the database",
        error: err.message,
      });
    }

    let volunteerData;
    try {
      // Fetch volunteer's email from the User model
      volunteerData = await User.findById(volunteer).select("email");
      if (!volunteerData) {
        return res.status(404).json({ message: "Volunteer not found" });
      }
    } catch (err) {
      return res.status(500).json({
        message: "Error fetching volunteer data",
        error: err.message,
      });
    }

    try {
      // Send registration confirmation email
      await nodemailer.sendRegistrationEmail(volunteerData.email, savedRegistration.registrationId);
    } catch (err) {
      return res.status(500).json({
        message: "Error sending confirmation email",
        error: err.message,
      });
    }

    // Successful response
    res.status(200).json({
      results: savedRegistration,
      message: "Volunteer Registered Successfully",
    });
  } catch (error) {
    // Catch any other unexpected errors
    res.status(500).json({
      message: "An unexpected error occurred",
      error: error.message,
    });
  }
};
