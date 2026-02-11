
// routes/verifyEmail.routes.js
import express from "express";
import {
  handleSendVerificationEmail,
  handleVerifyEmail,
  handleResendVerificationEmail,
} from "../controllers/verifyEmail.controller.js";
import { generalAuthLimiter } from "../middlewares/rateLimiter.js";


const router = express.Router();

// send verification email (logged-in user)
router.post("/verify-email", generalAuthLimiter, handleSendVerificationEmail);
router.post("/resend-verification", generalAuthLimiter, handleResendVerificationEmail);

// verify email via token
router.get("/verify-email/:token", handleVerifyEmail);

export default router;