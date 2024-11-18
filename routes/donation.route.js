import express from "express";
import * as donationController from "../controllers/donation.controller.js";
import { clearRedisCache } from "../lib/redis.js";
const router = express.Router();

router.post("/donate", donationController.donate);

export default router;
