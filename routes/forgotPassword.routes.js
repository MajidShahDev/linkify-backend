import express from "express";
import { body } from "express-validator";
import { handleForgotPassword, handleResetPassword } from "../controllers/forgotPassword.controller.js";

const router = express.Router();

// Forgot password form submission
router.post(
  "/forgot-password",
  [
    body("email").isEmail().withMessage("Please enter a valid email"),
  ],
  handleForgotPassword
);

// Reset password form submission
router.post(
  "/reset-password/:token",
  [
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  ],
  handleResetPassword
);

export default router;