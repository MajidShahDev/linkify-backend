import crypto from "crypto";
import User from "../models/user.model.js";
import nodemailer from "nodemailer"; // for sending emails
import AppError from "../utils/AppError.js";

export async function generateResetToken(email) {
  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError("No user found with this email", 404);
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expires = Date.now() + 1000 * 60 * 60; // 1 hour

  user.resetPasswordToken = token;
  user.resetPasswordExpires = expires;
  await user.save();

  return token;
}

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

export async function resetPassword(token, newPassword) {
  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() }, // check if token is not expired
    //                                            storedExpiryTime > currentTime return true else false
  });

  if (!user) {
    throw new AppError("Invalid or expired token", 400);
  }

  user.password = newPassword; 
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;

  await user.save();
  return user;
}
