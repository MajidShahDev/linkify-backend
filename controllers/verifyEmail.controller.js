// const User = require("../models/user.model");
import User from "../models/user.model.js";

import {
  generateEmailVerificationToken,
  sendVerificationEmail,
  verifyEmail,
} from "../services/verifyEmail.service.js";
import AppError from "../utils/AppError.js";

export async function handleSendVerificationEmail(reqOrUser, res = null) {
  try {
    // Determine if user called from signup (user object) or route (req object)
    let user;
    // signup (user object)
    if (reqOrUser && reqOrUser._id) {
      user = reqOrUser;
      // route (req object)
    } else if (reqOrUser && reqOrUser.user) {
      user = reqOrUser.user;
    } else {
      throw new AppError("User not found", 404);
    }

    const token = await generateEmailVerificationToken(user._id);
    await sendVerificationEmail(user.email, token);

    // If res exists for route call
    if (res) {
      return res.render("auth/verify-email", {
        message: "Verification email sent!",
        error: null,
        info: "We’ve sent a verification link to your email. Please check your inbox and click on the link to verify your account.",
      });
    }

    // If called internally for signup
    return { success: true, message: "Verification email sent!" };
  } catch (err) {
    if (res && err instanceof AppError) {
      return res.status(err.statusCode).render("auth/verify-email", {
        message: null,
        error: err.message,
        info: null,
      });
    }
    throw err; // centralized error handler
  }
}

export async function handleResendVerificationEmail(req, res) {
  try {
    const user = await User.findById(req.user._id);

    if (!user) throw new AppError("User not found", 404);

    if (user.isEmailVerified) {
      return res.render("auth/verify-email", {
        message: "Your email is already verified. Login here.",
        error: null,
        info: null,
      });
    }

    const token = await generateEmailVerificationToken(user._id);
    await sendVerificationEmail(user.email, token);

    return res.render("auth/verify-email", {
      message: "Verification email resent!",
      error: null,
      info: "We’ve sent a verification link to your email. Please check your inbox and click on the link to verify your account.",
    });
  } catch (err) {
    if (err instanceof AppError) {
      return res.status(err.statusCode).render("auth/verify-email", {
        message: null,
        error: err.message,
        info: null,
      });
    }
    throw err; // centralized error handler
  }
}

export async function handleVerifyEmail(req, res) {
  try {
    const { token } = req.params;
    await verifyEmail(token);

    return res.render("auth/verify-email-success");
  } catch (err) {
    if (err instanceof AppError) {
      return res.status(err.statusCode).render("auth/verify-email-success", {
        message: null,
        error: err.message,
        info: null,
      });
    }
    throw err; // centralized error handler
  }
}
