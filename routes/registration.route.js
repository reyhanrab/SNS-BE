import express from "express";
import * as registrationController from "../controllers/registration.controller.js";
import { clearRedisCache, saveDataToRedis, sendDataFromRedis } from "../lib/redis.js";
const router = express.Router();

// Get all campaigns
router.get("/", sendDataFromRedis, saveDataToRedis(), registrationController.getRegistrations);

// volunteer check-in
router.post("/:id/check-in", clearRedisCache("/registration"), registrationController.checkin);

// volunteer check-out
router.post("/:id/check-out", clearRedisCache("/registration"), registrationController.checkout);

export default router;
