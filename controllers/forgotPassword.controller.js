// const { validationResult } = require("express-validator");
import { validationResult } from "express-validator";
import {
  generateResetToken,
  sendResetEmail,
  resetPassword,
} from "../services/forgotPassword.service.js";
import bcrypt from "bcrypt";

// Handle forgot password request
export async function handleForgotPassword(req, res) {
  // validationResult(req) returns a Big Result object
  // Inside it, there’s a property called errors which is an array
  // .array() is a method of Result that simply returns this internal errors array
  const errors = validationResult(req);

  // Each field (like "email" or "password") can have multiple validation errors
  // If we just fieldErrors[err.path] = [] every time, we overwrite previous messages
  // fieldErrors = {}
  // Loop error1 -> fieldErrors["email"] = ["Invalid email"]
  // Loop error2 -> push -> fieldErrors["email"] = ["Invalid email", "Email already exists"]

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
      message: null, // always define message
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
      error: null, // always define error
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

// Handle reset password request
export async function handleResetPassword(req, res) {
  const errors = validationResult(req);
  const { token } = req.params;

  // 1️⃣ Handle validation errors
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

  // 2️⃣ Proceed with password reset
  try {
    const { password } = req.body;
    const { token } = req.params; // get token from URL

    const hashedPassword = await bcrypt.hash(password, 10);
    await resetPassword(token, hashedPassword);

    return res.redirect("/login");
  } catch (err) {
    const { token } = req.params; // pass token to template
    return res.status(400).render("auth/reset-password", {
      error: err.message,
      token, // this fixes the EJS ReferenceError
    });
  }
}


// Good code doesn’t only solve today’s UI —
// it prepares for tomorrow’s requirements.

// Why UI usually shows only ONE error
// UX reason (very important)
// Showing all errors at time: Email is required, Email must be valid, Email already exists
// Feels: noisy, stressful, confusing
// User fixes one thing at a time, Feels: clear, actionable, calm

// ❌ Wasted time = memorizing syntax (Syntax is: Google-able, auto-completed by IDE, forgettable)
// ✅ Valuable time = understanding WHY

// Memorizing syntax = memorizing traffic signs (You pass exams, but panic on real roads.)
// Understanding flow = understanding traffic (You can drive anywhere, even if signs change.)

// Syntax makes code run.
// Understanding makes you a developer.

////////////////////////////////////////////////////////////////////////////////////////////////
// PRG Pattern (Post → Redirect → Get)
//
// After a successful POST request:
//   ✔️ Always redirect to another GET route
//   ❌ Never render a page directly
//
// On validation or business errors:
//   ✔️ Render the same page with errors
//
// ✔️ Success → res.redirect()
// ✔️ Error   → res.render()

////////////////////////////////////////////////////////////////////////////////////////////////