import User from "../models/user.model.js";
import { generateToken } from "../services/auth.service.js";
import { sendEmailOTP } from "../services/otpEmail.service.js";
import crypto from "crypto";

export function verifyEmailOTPPage(req, res) {
  res.render("auth/verify-otp-email", { errors: {}, message: null });
}

export async function handleVerifyOTP(req, res) {
  const { otp } = req.body;

  const user = await User.findById(req.session.tempUserId);

  if (!user) {
    return res.redirect("/user/login");
  }

  const view ="auth/verify-otp-email";

  if (user.twoFactorCode !== otp) {
    return res.status(400).render(view, {
      errors: { general: ["Invalid OTP"] },
      message: null,
    });
  }

  if (user.twoFactorExpires < Date.now()) {
    return res.status(400).render(view, {
      errors: { general: ["OTP expired"] },
      message: null,
    });
  }

  // clear OTP
  user.twoFactorCode = undefined;
  user.twoFactorExpires = undefined;
  await user.save();

  const token = generateToken(user);

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  req.session.tempUserId = null;

  return res.redirect("/");
}

export async function handleSendEmailOTP(req, res) {
  try {
    // 👇 get user from session (NOT body)
    console.log("Reached handleSendEmailOTP");
    const user = await User.findById(req.session.tempUserId);

    if (!user) {
      return res.redirect("/user/login");
    }

    const email = user.email;

    // generate OTP
    const otp = crypto.randomInt(100000, 999999).toString();

    user.twoFactorCode = otp;
    user.twoFactorExpires = Date.now() + 5 * 60 * 1000; // 5 min

    await user.save();

    await sendEmailOTP(email, otp);
    req.session.otp = {
      type: "email",
    };
    const isResend = req.originalUrl.includes("resend");

    return res.render("auth/verify-otp-email", {
      errors: {},
      message: isResend ? "New OTP sent successfully" : "OTP sent successfully",
    });
  } catch (err) {
    console.error("Email OTP Error:", err);
    return res.status(500).render("auth/verify-otp-email", {
      errors: { general: ["Failed to send OTP"] },
      message: null,
    });
  }
}
