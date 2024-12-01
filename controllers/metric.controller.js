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
    const totalDonations = await Campaign.aggregate([
      {
        $group: {
          _id: null, // Group all documents together
          totalAmount: { $sum: "$raisedAmount" }, // Sum the raisedAmount field
        },
      },
    ]);

    res.status(200).json({ results: {
      totalCampaigns,
      totalVolunteers,
      totalActiveVolunteers,
      totalDonations: (totalDonations[0]?.totalAmount).toLocaleString() || 0,
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

// 5. Get most recent donation for campaign
export const campaignDonations = async (req, res) => {
  try {
    // Fetch the 3 most recent payments
    const recentPayments = await Payment.find()
      .sort({ paymentDate: -1 }) // Sort by paymentDate in descending order
      .limit(3) // Limit the results to 3
      .populate("campaign", "title"); // Populate the campaign field to get the title

    if (recentPayments.length === 0) {
      return res.status(404).json({ message: "No payments found." });
    }

    // Prepare response data
    const response = recentPayments.map((payment) => ({
      campaignTitle: payment.campaign?.title || "Unknown Campaign",
      donationAmount: (payment.amount).toLocaleString(), // Format amount as a string
      paymentDate: payment.paymentDate,
    }));

    // Send the response
    res.status(200).json({results: response});
  } catch (error) {
    console.error("Error fetching recent donations:", error);
    res.status(500).json({ error: "Error fetching recent donations." });
  }
}
