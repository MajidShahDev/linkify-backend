import bcrypt from "bcrypt";
import User from "../models/user.model.js";
import { generateToken } from "./auth.service.js";
import AppError from "../utils/AppError.js";

export async function signup({ name, email, password }) {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError("User with this email already exists", 400);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  return user;
}

export async function login({ user, password }) {
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new AppError("Invalid email or password", 400);
  }
// if 2fa enabled then stop here
    if (user.twoFactorEnabled) {
    return { requires2FA: true, user };
  }

  const token = generateToken(user);
  return { user, token };
}
