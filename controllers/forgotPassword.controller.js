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
    console.log(errors);
    console.log(errors.array());
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

    res.render("auth/forgot-password", {
      message: "Reset link sent to your email!",
      error: null, 
      errors: null,
      oldInput: { email },
    });
  } catch (err) {
    res.status(400).render("auth/forgot-password", {
      message: null,
      error: err.message,
      oldInput: { email: req.body.email || "" },
      errors: {},
    });
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
    const { token } = req.params;

    const hashedPassword = await bcrypt.hash(password, 10);
    await resetPassword(token, hashedPassword);

    return res.redirect("/login");
  } catch (err) {
    const { token } = req.params;
    return res.status(400).render("auth/reset-password", {
      error: err.message,
      token,
    });
  }
}
