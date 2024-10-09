import express from "express";
import * as authController from "../controllers/auth.controller.js";
const router = express.Router();

// Register a new user
router.post("/signup", authController.signup);

export default router;
