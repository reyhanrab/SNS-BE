import express from "express";
import * as userController from "../controllers/user.controller.js";
import * as authController from "../controllers/auth.controller.js";

const router = express.Router();

// Create a new user
router.post("/", userController.createUser);

// Get all users
router.get("/", userController.getUsers);

// Get a user by ID
router.get("/:id", userController.getUserById);

// Update a user
router.patch("/:id", userController.updateUser);

// Change Password
router.patch("/:id/change-password", authController.resetPasswordWhenLoggedIn);

// Delete a user
router.delete("/:id", userController.deleteUser);

export default router;
