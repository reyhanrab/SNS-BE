import express from "express";
import * as campaignController from "../controllers/campaign.controller.js";
import { clearRedixCache, saveDataToRedis, sendDataFromRedis } from "../lib/redis.js";
const router = express.Router();

// Create a new campaign
router.post("/", clearRedixCache("/campaign"), campaignController.createCampaign);

// Get all campaigns
router.get("/", sendDataFromRedis, saveDataToRedis(), campaignController.getCampaigns);

// Update a campaign
router.patch("/:id", clearRedixCache("/campaign"), campaignController.updateCampaign);

// volunteer registration
router.post("/:id/registration", clearRedixCache("/registration"), campaignController.register);

export default router;
