import express from "express";
import * as campaignController from "../controllers/campaign.controller.js";
import { clearRedisCache, saveDataToRedis, sendDataFromRedis } from "../lib/redis.js";
const router = express.Router();

// Create a new campaign
router.post("/", clearRedisCache("/campaign"), campaignController.createCampaign);

// Get all campaigns
router.get("/", sendDataFromRedis, saveDataToRedis(), campaignController.getAllCampaigns);

// Get all paginated
router.get("/paginated", campaignController.getPaginatedCampaigns);

// Get all campaigns
router.get("/:id", campaignController.getCampaginById);

// Update a campaign
router.patch("/:id", clearRedisCache("/campaign"), campaignController.updateCampaign);

// volunteer registration
router.post("/:id/registration", clearRedisCache("/registration"), campaignController.register);

export default router;
