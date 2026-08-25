import User from "../models/user.model.js";
import { generateToken } from "../services/auth.service.js";
import { sendEmailOTP } from "../services/otpEmail.service.js";
import { storeOtp, verifyOtp } from "../services/otp.service.js";
import AppError from "../utils/AppError.js";

export function verifyEmailOTPPage(req, res) {
  res.render("auth/verify-otp-email", { errors: {}, message: null });
}

export async function handleVerifyOTP(req, res) {
  const { otp } = req.body;
  const purpose = req.session.otp?.purpose;
  const userId = purpose === "login" ? req.session.tempUserId : req.user?._id;
  const view = "auth/verify-otp-email";

  if (!userId) return res.redirect("/user/login");

  const user = await User.findById(userId);
  if (!user) return res.redirect("/user/login");

  // REDIS CHECK - replaces user.twoFactorCode check
  const result = await verifyOtp(userId.toString(), otp, purpose);

  if (!result.valid) {
    let msg = "Invalid OTP";
    if (result.reason === "expired") msg = "OTP expired";
    if (result.reason === "max_attempts")
      msg = "Too many attempts, resend new code";

    return res.status(400).render(view, {
      errors: { general: [msg] },
      message: null,
    });
  }

  // Valid OTP - proceed
  switch (purpose) {
    case "login": {
      const token = generateToken(user);
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 1000 * 60 * 60 * 24 * 30,
      });
      req.session.tempUserId = null;
      req.session.otp = null;
      return res.redirect("/");
    }
    case "enable-2fa": {
      user.twoFactorEnabled = true;
      await user.save();
      req.session.otp = null;
      return res.redirect("/profile?success=2fa-enabled");
    }
    case "disable-2fa": {
      user.twoFactorEnabled = false;
      await user.save();
      req.session.otp = null;
      return res.redirect("/profile?success=2fa-disabled");
    }
    default:
      return res.status(400).render(view, {
        errors: { general: ["Invalid OTP purpose"] },
        message: null,
      });
  }
}

export async function handleSendEmailOTP(req, res) {
  try {
    const purpose = req.session.otp?.purpose;
    const userId = purpose === "login" ? req.session.tempUserId : req.user?._id;

    const user = await User.findById(userId);
    if (!user) return res.redirect("/user/login");

    // REDIS STORE - replaces crypto + user.save()
    const otp = await storeOtp(userId.toString(), purpose, 5 * 60);
    await sendEmailOTP(user.email, otp);

    const isResend = req.originalUrl.includes("resend");

    return res.render("auth/verify-otp-email", {
      errors: {},
      message: isResend ? "New OTP sent successfully" : "OTP sent successfully",
    });
  } catch (err) {
    if (err instanceof AppError) {
      return res.status(err.statusCode).render("auth/verify-otp-email", {
        errors: { general: ["Failed to send OTP"] },
        message: null,
      });
    }
    throw err; // → centralized error handler
  }
}
