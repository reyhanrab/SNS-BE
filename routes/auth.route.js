import express from "express";
import * as authController from "../controllers/auth.controller.js";
import {
  signupValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  resendCodeValidation,
} from "../joiValidations/auth.validations.js";
import { validate } from "../lib/utils.js";

const router = express.Router();

// Register a new user
router.post("/signup", validate(signupValidation), authController.signup);

// Login
router.patch("/login", validate(loginValidation), authController.login);

// Logout
router.patch("/logout", authController.logout);

// forgot password
router.patch("/forgot-password", validate(forgotPasswordValidation), authController.forgotPassword);

// resent code
router.patch("/resend-code", validate(resendCodeValidation), authController.resendCode);

// reset password
router.patch("/reset-password", validate(resetPasswordValidation), authController.resetPassword);

export default router;
