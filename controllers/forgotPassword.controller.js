import { validationResult } from "express-validator";
import {
  generateResetToken,
  sendResetEmail,
  resetPassword,
} from "../services/forgotPassword.service.js";
import bcrypt from "bcrypt";

export async function handleForgotPassword(req, res) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const fieldErrors = {};
    errors.array().forEach((err) => {
      if (!fieldErrors[err.path]) {
        fieldErrors[err.path] = [];
      }
      fieldErrors[err.path].push(err.msg);
    });

    return res.status(400).render("auth/forgot-password", {
      message: null,
      error: fieldErrors.email ? fieldErrors.email[0] : null,
      errors: {},
      oldInput: { email: req.body.email || "" },
    });
  }

  try {
    const { email } = req.body;
    const token = await generateResetToken(email);
    await sendResetEmail(email, token);

    return res.render("auth/forgot-password", {
      message: "Reset link sent to your email!",
      error: null,
      errors: null,
      oldInput: { email },
    });
  } catch (err) {
    if (err instanceof AppError) {
      return res.status(err.statusCode).render("auth/forgot-password", {
        message: null,
        error: err.message,
        oldInput: { email: req.body.email || "" },
        errors: {},
      });
    }
    throw err; // centralized error handler
  }
}

export async function handleResetPassword(req, res) {
  const errors = validationResult(req);
  const { token } = req.params;

  if (!errors.isEmpty()) {
    const fieldErrors = {};
    errors.array().forEach((err) => {
      if (!fieldErrors[err.path]) {
        fieldErrors[err.path] = [];
      }
      fieldErrors[err.path].push(err.msg);
    });

    return res.status(400).render("auth/reset-password", {
      error: fieldErrors.password ? fieldErrors.password[0] : null,
      oldInput: {},
      token,
    });
  }

  try {
    const { password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);
    await resetPassword(token, hashedPassword);

    return res.redirect("/login");
  } catch (err) {
    if (err instanceof AppError) {
      return res.status(err.statusCode).render("auth/reset-password", {
        error: err.message,
        token,
      });
    }
    throw err; // centralized error handler
  }
}
