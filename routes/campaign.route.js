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

// volunteer check-in
router.post("/:id/check-in/:registrationId", campaignController.checkin);

// volunteer check-out
router.post("/:id/check-out/:registrationId", campaignController.checkin);


export default router;
