import express from "express";
import * as campaignController from "../controllers/campaign.controller.js";
const router = express.Router();

// Create a new campaign
router.post("/", campaignController.createCampaign);

// Get all campaigns
router.get("/", campaignController.getCampaigns);

// Update a campaign
router.patch("/:id", campaignController.updateCampaign);

// volunteer registration
router.post("/:id/registration", campaignController.register);


export default router;
