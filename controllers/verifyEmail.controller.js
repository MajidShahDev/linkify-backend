// const User = require("../models/user.model");
import User from "../models/user.model.js";

import {
  generateEmailVerificationToken,
  sendVerificationEmail,
  verifyEmail,
} from "../services/verifyEmail.service.js";

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
      throw new Error("User not found");
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
    if (res) {
      return res.render("auth/verify-email", {
        message: null,
        error: err.message,
        info: null,
      });
    }

    // Internal call,
    throw err;
  }
}

export async function handleResendVerificationEmail(req, res) {
  try {
    // ✅ Fetch latest user from DB
    const user = await User.findById(req.user._id);

    if (!user) throw new Error("User not found");

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
    return res.render("auth/verify-email", {
      message: null,
      error: err.message,
      info: null,
    });
  }
}

export async function handleVerifyEmail(req, res) {
  try {
    const { token } = req.params;
    await verifyEmail(token);

    return res.render("auth/verify-email-success");
  } catch (err) {
    return res.render("auth/verify-email-success", {
      message: null,
      error: err.message,
      info: null,
    });
  }
}
