import bcrypt from "bcrypt";
import User from "../models/user.model.js";
import { generateToken } from "./auth.service.js"; // adjust path

// Signup logic
export async function signup({ name, email, password }) {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error("User with this email already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  return user;
}

// Login logic
export async function login({ email, password }) {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("Invalid email or password");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Invalid email or password");
  }
// if 2fa enabled then stop here
    if (user.twoFactorEnabled) {
    return { requires2FA: true, user };
  }

  const token = generateToken(user);
  return { user, token };
}
