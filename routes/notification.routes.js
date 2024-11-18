import express from "express";
import * as notificationController from "../controllers/notification.controller.js";
import { saveDataToRedis, sendDataFromRedis } from "../lib/redis.js";
const router = express.Router();

// Get all notifications
router.get("/", notificationController.getNotifications);

export default router;
