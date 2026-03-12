// services/verifyEmail.service.js
import crypto from "crypto";
import nodemailer from "nodemailer";
import User from "../models/user.model.js";


// generate token + save
export async function generateEmailVerificationToken(userId) {
  const token = crypto.randomBytes(32).toString("hex");

  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  user.emailVerificationToken = token;
  user.emailVerificationExpires = Date.now() + 1000 * 60 * 60; // 1 hour
  await user.save();

  return token;
}

// send email
export async function sendVerificationEmail(email, token) {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const verifyUrl = `${process.env.BASE_URL}/verify-email/${token}`;

  await transporter.sendMail({
    from: `"Linkify App" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Verify your email",
    html: `
      <p>Please verify your email by clicking the link below:</p>
      <a href="${verifyUrl}">${verifyUrl}</a>
      <p>This link will expire in 1 hour.</p>
    `,
  });
}

// verify token
export async function verifyEmail(token) {
  const user = await User.findOne({
    emailVerificationToken: token,
    emailVerificationExpires: { $gt: Date.now() },
  });

  if (!user) throw new Error("Invalid or expired verification link");

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;

  await user.save();
  return user;
}

