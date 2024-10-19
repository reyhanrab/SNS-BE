import Campaign from "../models/campaign.model.js";

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
      res.status(200).json({ message: "Campaigns created successfully", results: result });
    } else {
      // Handle single campaign object
      const campaign = new Campaign(campaignData);
      const result = await campaign.save();
      res.status(200).json({ message: "Campaign created successfully", results: result });
    }
  } catch (error) {
    res.status(500).json({ message: "Error creating campaign(s)", error: error.message });
  }
};