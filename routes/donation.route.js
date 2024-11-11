import express from "express";
import * as donationController from "../controllers/donation.controller.js";
const router = express.Router();

router.post("/donate", donationController.donate);

export default router;
