import express from "express";
import * as campaignController from "../controllers/campaign.controller.js";
const router = express.Router();

// Create a new campaign
router.post("/", campaignController.createCampaign);

// Get all campaigns
router.get("/", campaignController.getCampaigns);

// Update a campaign
router.put("/:id", campaignController.updateCampaign);

export default
 router;
