import User from "../models/user.model.js";
import { generateToken } from "../services/auth.service.js";
import { sendEmailOTP } from "../services/otpEmail.service.js";
import crypto from "crypto";

export function verifyEmailOTPPage(req, res) {
  res.render("auth/verify-otp-email", { errors: {}, message: null });
}

export async function handleVerifyOTP(req, res) {
  const { otp } = req.body;

  const purpose = req.session.otp?.purpose;

  // Determine which user to verify
  const userId =
    purpose === "login" ? req.session.tempUserId : req.user?._id;

  const user = await User.findById(userId);

  if (!user) {
    return res.redirect("/user/login");
  }

  const view = "auth/verify-otp-email";

  // Invalid OTP
  if (user.twoFactorCode !== otp) {
    return res.status(400).render(view, {
      errors: { general: ["Invalid OTP"] },
      message: null,
    });
  }

  // Expired OTP
  if (!user.twoFactorExpires || user.twoFactorExpires < Date.now()) {
    return res.status(400).render(view, {
      errors: { general: ["OTP expired"] },
      message: null,
    });
  }

  // Clear OTP
  user.twoFactorCode = undefined;
  user.twoFactorExpires = undefined;

  switch (purpose) {
    case "login": {
      await user.save();

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
        errors: {
          general: ["Invalid OTP purpose"],
        },
        message: null,
      });
  }
}

export async function handleSendEmailOTP(req, res) {
  try {
    const purpose = req.session.otp?.purpose;

    // Determine which user to send OTP to
    const userId =
      purpose === "login"
        ? req.session.tempUserId
        : req.user?._id;

    const user = await User.findById(userId);

    if (!user) {
      return res.redirect("/user/login");
    }

    // Generate OTP
    const otp = crypto.randomInt(100000, 999999).toString();

    user.twoFactorCode = otp;
    user.twoFactorExpires = Date.now() + 5 * 60 * 1000; // 5 minutes

    await user.save();

    // Send OTP email
    await sendEmailOTP(user.email, otp);

    const isResend = req.originalUrl.includes("resend");

    return res.render("auth/verify-otp-email", {
      errors: {},
      message: isResend
        ? "New OTP sent successfully"
        : "OTP sent successfully",
    });

  } catch (err) {
    console.error("Email OTP Error:", err);

    return res.status(500).render("auth/verify-otp-email", {
      errors: { general: ["Failed to send OTP"] },
      message: null,
    });
  }
}
