import express from "express";
import * as metrics from "../controllers/metric.controller.js";

const router = express.Router();

router.get("/summary", metrics.summary);

// Get the campaign status counts 
router.get("/campaign-status", metrics.campaignStatus);

// Get donation trends based on the donations over time
router.get("/donation-trends", metrics.donationTrends);

// Get volunteer registration trends (volunteers registered over time)
router.get("/volunteer-trends", metrics.volunteerTrends);

// Get donations per campaign
router.get("/campaign-donations", metrics.campaignDonations);

export default router;
