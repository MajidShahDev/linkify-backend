const express = require("express");
const { body } = require("express-validator");
const { handleForgotPassword, handleResetPassword } = require("../controllers/forgotPassword.controller");
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

module.exports = router;