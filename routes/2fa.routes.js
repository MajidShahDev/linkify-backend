import express from "express";
import {
  handleVerifyOTP,
  verifyEmailOTPPage,
  handleSendEmailOTP,
} from "../controllers/2fa.controller.js";
import { body } from "express-validator";
import {
  emailOtpSendLimiter,
  generalAuthLimiter,
} from "../middlewares/rateLimiter.js";
import { requireTempUser } from "../middlewares/tempUser.middleware.js";

const router = express.Router();

router.get("/verify-otp-email", requireTempUser, (req, res) => {
  res.render("auth/verify-otp-email", {
    errors: {},
    message: null,
  });
});


router.post(
  "/verify-otp",
  generalAuthLimiter,
  [
    body("otp")
      .notEmpty()
      .withMessage("OTP is required")
      .isLength({ min: 6, max: 6 })
      .withMessage("OTP must be exactly 6 digits")
      .isNumeric()
      .withMessage("OTP must contain only numbers"),
  ],
  handleVerifyOTP
);


router.post("/send-email-otp", emailOtpSendLimiter, handleSendEmailOTP);

router.post("/resend-email-otp", emailOtpSendLimiter, handleSendEmailOTP);

export default router;
