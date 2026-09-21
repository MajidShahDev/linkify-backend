
import express from "express";
import {
  handleSendVerificationEmail,
  handleVerifyEmail,
  handleResendVerificationEmail,
} from "../controllers/verifyEmail.controller.js";
import { generalAuthLimiter } from "../middlewares/rateLimiter.middleware.js";


const router = express.Router();

router.post("/verify-email", generalAuthLimiter, handleSendVerificationEmail);
router.post("/resend-verification", generalAuthLimiter, handleResendVerificationEmail);

router.get("/verify-email/:token", handleVerifyEmail);

export default router;