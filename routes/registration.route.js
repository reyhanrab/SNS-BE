import express from "express";
import * as registrationController from "../controllers/registration.controller.js";
const router = express.Router();

// Get all campaigns
router.get("/", registrationController.getRegistrations);

// volunteer check-in
router.post("/:id/check-in", registrationController.checkin);

// volunteer check-out
router.post("/:id/check-out", registrationController.checkout);

export default router;
