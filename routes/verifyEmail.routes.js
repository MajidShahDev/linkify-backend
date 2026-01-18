// routes/verifyEmail.routes.js
const express = require("express");
const {
  handleSendVerificationEmail,
  handleVerifyEmail,
  handleResendVerificationEmail,
} = require("../controllers/verifyEmail.controller");

const router = express.Router();

// send verification email (logged-in user)
router.post("/verify-email", handleSendVerificationEmail);
router.post("/resend-verification", handleResendVerificationEmail);

// verify email via token
router.get("/verify-email/:token", handleVerifyEmail);

module.exports = router;
