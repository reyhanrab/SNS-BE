import nodemailer from "../lib/nodemailer.js";
import Campaign from "../models/campaign.model.js";
import User from "../models/user.model.js";

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
        res
          .status(201)
          .json({
            message: "Campaigns created successfully and notifications sent.",
            campaigns: result,
          });
      } catch (error) {
        console.error("Error sending email notifications:", error.message);
        res
          .status(500)
          .json({
            message: "Campaigns created, but error occurred while sending notifications.",
            campaigns: result,
          });
      }
    } else {
      // Handle single campaign object
      const campaign = new Campaign(campaignData);
      const result = await campaign.save();

      // Send email notifications for a single campaign
      try {
        const volunteers = await User.find({ role: "volunteer" });

        if (volunteers.length === 0) {
          console.log("No volunteers found to notify.");
          return res
            .status(201)
            .json({ message: "Campaign created successfully", campaign: result });
        }

        const emailPromises = volunteers.map(async (volunteer) => {
          await nodemailer.newCampaignEmail(volunteer); // Ensure this method is defined in your nodemailer config
          console.log(`Email sent to ${volunteer.email}`);
        });

        await Promise.all(emailPromises);
        res
          .status(201)
          .json({
            message: "Campaign created successfully and notifications sent.",
            campaign: result,
          });
      } catch (error) {
        console.error("Error sending email notifications:", error.message);
        res
          .status(500)
          .json({
            message: "Campaign created, but error occurred while sending notifications.",
            campaign: result,
          });
      }
    }
  } catch (error) {
    res.status(500).json({ message: "Error creating campaign(s)", error: error.message });
  }
};

// Get all campaigns
export const getCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find();
    res.status(200).json({ campaigns });
  } catch (error) {
    res.status(500).json({ message: "Error fetching campaigns", error });
  }
};