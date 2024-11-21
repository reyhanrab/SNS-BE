import Campaign from "../models/campaign.model.js";
import User from "../models/user.model.js";
import Payment from "../models/payment.model.js";
import Registration from "../models/registration.model.js";

// 1. Get total counts for dashboard metrics
export const summary = async (req, res) => {
  try {
    const totalCampaigns = await Campaign.countDocuments();
    const totalVolunteers = await User.countDocuments({ role: "volunteer" });
    const distinctVolunteers = await Registration.distinct("volunteer");
    const totalActiveVolunteers = distinctVolunteers.length;
    const totalDonations = await Payment.aggregate([
      { $group: { _id: null, totalAmount: { $sum: "$amount" } } },
    ]);

    res.status(200).json({ results: {
      totalCampaigns,
      totalVolunteers,
      totalActiveVolunteers,
      totalDonations: (totalDonations[0]?.totalAmount/ 100).toLocaleString() || 0,
    }});
  } catch (error) {
    res.status(500).json({ error: "Error fetching dashboard summary." });
  }
};

// 2. Get campaign statuses
export const campaignStatus = async (req, res) => {
  try {
    // Get today's date (set to midnight to ignore time part)
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set time to the start of the day (midnight)

    // Query to get ongoing campaigns (startDate <= today and endDate >= today)
    const ongoingCount = await Campaign.countDocuments({
      startDate: { $lte: today },
      endDate: { $gte: today },
    });

    // Query to get upcoming campaigns (startDate > today)
    const upcomingCount = await Campaign.countDocuments({
      startDate: { $gt: today },
    });

    // Query to get completed campaigns (endDate < today)
    const completedCount = await Campaign.countDocuments({
      endDate: { $lt: today },
    });

    // Response with the counts of each campaign status
    const response = [
      { name: "Upcoming", count: upcomingCount },
      { name: "Ongoing", count: ongoingCount },
      { name: "Completed", count: completedCount },
    ];

    res.status(200).json({ results: response });
  } catch (error) {
    res.status(500).json({ error: "Error fetching campaign statuses." });
  }
};

// 3. Get donations trends
export const donationTrends = async (req, res) => {
  try {
    const donationTrends = await Payment.aggregate([
      {
        $group: {
          _id: { $month: "$paymentDate" }, // Group by month of the paymentDate
          totalAmount: { $sum: "$amount" }, // Sum the amounts for each month
        },
      },
      { $sort: { _id: 1 } }, // Sort by month (ascending)
    ]);

    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    // Map the result to match the month names and donation totals
    const response = donationTrends.map((trend) => ({
      month: months[trend._id - 1], // Use the month name from the array
      donations: trend.totalAmount, // The sum of donations for that month
    }));

    res.status(200).json({ results: response });
  } catch (error) {
    res.status(500).json({ error: "Error fetching donation trends." });
  }
};

// 4. Get volunteer registration trends
export const volunteerTrends = async (req, res) => {
  try {
    const volunteerTrends = await Registration.aggregate([
      {
        $group: {
          _id: { $month: "$registrationDate" },
          totalVolunteers: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const response = volunteerTrends.map((trend) => ({
      month: months[trend._id - 1],
      volunteers: trend.totalVolunteers,
    }));

    res.status(200).json({ results: response });
  } catch (error) {
    res.status(500).json({ error: "Error fetching volunteer trends." });
  }
};

// 5. Get list of donations per campaign
export const campaignDonations = async (req, res) => {
  try {
    // Aggregate payments by campaign ID and sum the donation amounts
    const campaignDonations = await Payment.aggregate([
      {
        $group: {
          _id: "$campaign",  // Group by campaign ID (referencing 'campaign' in Payment model)
          totalDonations: { $sum: "$amount" }, // Sum the donation amounts
        },
      },
    ]);

    // Use Promise.all to fetch the campaign details for each donation record
    const response = await Promise.all(
      campaignDonations.map(async (donation) => {
        const campaign = await Campaign.findById(donation._id);
        return {
          campaignTitle: campaign?.title || "Unknown Campaign", // Use 'title' from Campaign model
          donations: (donation.totalDonations/ 100).toLocaleString(),
        };
      })
    );

    res.status(200).json({ results: response });
  } catch (error) {
    res.status(500).json({ error: "Error fetching campaign donations." });
  }
};