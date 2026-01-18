const { validationResult } = require("express-validator");
const { generateResetToken, sendResetEmail, resetPassword } = require("../services/forgotPassword.service");
const bcrypt = require("bcrypt");

// Handle forgot password request
async function handleForgotPassword(req, res) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const fieldErrors = {};
    errors.array().forEach((err) => {
      if (!fieldErrors[err.path]) fieldErrors[err.path] = [];
      fieldErrors[err.path].push(err.msg);
    });

    return res.status(400).render("forgot-password", {
      message: null,                 // always define message
      error: fieldErrors.email ? fieldErrors.email[0] : null,
      oldInput: { email: req.body.email || "" },
    });
  }

  try {
    const { email } = req.body;
    const token = await generateResetToken(email);
    await sendResetEmail(email, token);

    res.render("forgot-password", {
      message: "Reset link sent to your email!",
      error: null,                   // always define error
      oldInput: { email },
    });
  } catch (err) {
    res.status(400).render("forgot-password", {
      message: null,
      error: err.message,
      oldInput: { email: req.body.email || "" },
    });
  }
}


// Handle reset password request
async function handleResetPassword(req, res) {
  const errors = validationResult(req);

  // 1️⃣ Handle validation errors
  if (!errors.isEmpty()) {
    const fieldErrors = {};
    errors.array().forEach((err) => {
      if (!fieldErrors[err.path]) {
        fieldErrors[err.path] = [];
      }
      fieldErrors[err.path].push(err.msg);
    });

    return res.status(400).render("reset-password", {
      error: fieldErrors.password ? fieldErrors.password[0] : null,
      oldInput: {},
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
    return res.status(400).render("reset-password", {
      error: err.message,
      token, // ✅ this fixes the EJS ReferenceError
    });
  }
}

module.exports = {
  handleForgotPassword,
  handleResetPassword,
};
