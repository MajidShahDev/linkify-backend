import { validationResult } from "express-validator";
import { signup, login } from "../services/user.service.js";
import { handleSendVerificationEmail } from "../controllers/verifyEmail.controller.js";
import { sendEmailOTP } from "../services/otpEmail.service.js";
import User from "../models/user.model.js";
import fs from "fs";
import path from "path";
import { handleSendEmailOTP } from "./2fa.controller.js";
import { appLogger } from "../config/logger.js";
import { storeOtp } from "../services/otp.service.js";
import AppError from "../utils/AppError.js";
import { processLoginContinuation } from "../services/loginContinuation.service.js";

export async function handleUserSignup(req, res) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const fieldErrors = {};

    errors.array().forEach((err) => {
      if (!fieldErrors[err.path]) {
        fieldErrors[err.path] = [];
      }
      fieldErrors[err.path].push(err.msg);
    });

    return res.status(400).render("auth/signup", {
      errors: fieldErrors,
      oldInput: {
        name: req.body.name || "",
        email: req.body.email || "",
      },
    });
  }

  try {
    const { name, email, password } = req.body;
    const user = await signup({ name, email, password });
    await handleSendVerificationEmail(user);
    return res.render("auth/login", {
      message: "Signup successful!",
      errors: null,
      info: "We’ve sent a verification link to your email. Please check your inbox and click on the link to verify your account.",
      oldInput: {
        name: "",
        email: req.body.email || "",
      },
      continueToken: req.query.continue || null
    });
  } catch (err) {
    if (err instanceof AppError) {
      return res.status(err.statusCode).render("auth/signup", {
        errors: {
          email: [err.message], // always an array
        },
        oldInput: {
          name: req.body.name || "",
          email: req.body.email || "",
        },
      });
    }
    throw err; // centralized error handler
  }
}

export async function handleLoginContinuation(req, res, user, continueToken) {
  const urlEntry = await processLoginContinuation(user, continueToken);

  if (!urlEntry) {
    return res.redirect("/");
  }

  return res.redirect(`/?created=${urlEntry.shortId}`);
}

export async function handleUserLogin(req, res) {
  const continueToken = req.body.continue;
  
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const fieldErrors = {};
    errors.array().forEach((err) => {
      if (!fieldErrors[err.path]) fieldErrors[err.path] = [];
      fieldErrors[err.path].push(err.msg);
    });
    return res.status(400).render("auth/login", {
      errors: fieldErrors,
      oldInput: { email: req.body.email || "" },
      continueToken: continueToken || null,
    });
  }
  
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).render("auth/login", {
        errors: { general: ["Invalid email or password"] },
        oldInput: { email },
        continueToken: continueToken || null,
      });
    }

    if (user.provider === "google" || user.password === null) {
      return res.status(400).render("auth/login", {
        errors: {
          general: [
            "You signed up using Google. Please login with Google first.",
          ],
        },
        oldInput: { email },
        continueToken: continueToken || null,
      });
    }

    const result = await login({ user, password });

    // 2FA REQUIRED - REDIS VERSION
    if (result.requires2FA) {
      const loggedInUser = result.user;
      const otp = await storeOtp(loggedInUser._id.toString(), "login", 10 * 60); // 10 min valid
      await sendEmailOTP(loggedInUser.email, otp);

      req.session.tempUserId = loggedInUser._id;
      req.session.otp = {
        type: "email",
        purpose: "login",
      };
      req.session.continueToken = continueToken || null;
      
      return res.redirect("/auth/verify-otp-email");
    }

    // NORMAL LOGIN
    res.cookie("token", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 1000 * 60 * 60 * 24 * 30,
    });
    return handleLoginContinuation(req, res, result.user, continueToken);
  } catch (err) {
    if (err instanceof AppError) {
      return res.status(err.statusCode).render("auth/login", {
        errors: { general: [err.message] },
        oldInput: { email: req.body.email || "" },
        continueToken: continueToken || null,
      });
    }
    throw err; // centralized error handler
  }
}

export function handleUserLogout(req, res) {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/", // Match the cookie's original creation path.
  });
  // res.redirect("https://accounts.google.com/logout");
  return res.redirect("/login");
}

export async function handleUploadProfileImage(req, res) {
    if (!req.file) {
      return res.redirect("/profile?error=no_file");
    }

    const user = await User.findById(req.user._id);
    if (user.profileImage && user.profileImage !== "/images/default.svg") {
      const oldImagePath = path.join(
        process.cwd(),
        "public",
        user.profileImage
      );

      // Delete old image if not default
      fs.unlink(oldImagePath, (err) => {
        if (err) {
          appLogger.warn("Failed to delete old profile image", {
            userId: user._id,
            path: oldImagePath,
            message: err.message,
          });
        }
      });
    }

    const newImagePath = `/uploads/profile/${req.file.filename}`;
    user.profileImage = newImagePath;
    await user.save();

    return res.redirect("/profile?success=1");
}

export async function requestToggle2FA(req, res) {
  const user = await User.findById(req.user._id);

  req.session.otp = {
    type: "email",
    purpose: user.twoFactorEnabled ? "disable-2fa" : "enable-2fa",
  };

  return handleSendEmailOTP(req, res);
}
