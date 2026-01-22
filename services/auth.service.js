// const jwt = require("jsonwebtoken");
import jwt from "jsonwebtoken";

const secretKey = process.env.JWT_SECRET;

export function setUser(user) {
  const payload = {
    _id: user._id,
    role: user.role,
    email: user.email,
  };
  return jwt.sign(payload, secretKey);
}

export function getUser(token) {
  if (!token) return null;
  try {
    return jwt.verify(token, secretKey);
  } catch {
    return null;
  }
}
