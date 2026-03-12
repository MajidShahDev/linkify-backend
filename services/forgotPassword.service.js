import crypto from "crypto";
import User from "../models/user.model.js";
import nodemailer from "nodemailer"; // for sending emails


// Generate reset token and save expiry
export async function generateResetToken(email) {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("No user found with this email");
  }

  // Generate token
  const token = crypto.randomBytes(32).toString("hex");
  const expires = Date.now() + 1000 * 60 * 60; // 1 hour

  // Save token and expiry in user record
  user.resetPasswordToken = token;
  user.resetPasswordExpires = expires;
  await user.save();

  return token;
}

// Send reset email
export async function sendResetEmail(email, token) {
  // configure nodemailer (use your SMTP config)
  
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  
  transporter.verify((error) => {
    if (error) console.log(error);
    else console.log("SMTP server ready to send emails");
  });

  const resetUrl = `${process.env.BASE_URL}/reset-password/${token}`;

  await transporter.sendMail({
    from: `"Linkify App" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Password Reset",
    html: `<p>Click the link below to reset your password:</p>
           <a href="${resetUrl}">${resetUrl}</a>
           <p>This link will expire in 1 hour.</p>`,
  });
}

// Reset password function
export async function resetPassword(token, newPassword) {
  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() }, // check if token is not expired
    //                                            storedExpiryTime > currentTime return true else false
  });

  if (!user) {
    throw new Error("Invalid or expired token");
  }

  user.password = newPassword; // hash will be handled in pre-save hook or hash manually
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;

  await user.save();
  return user;
}
