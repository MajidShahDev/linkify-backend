const bcrypt = require("bcrypt");
const User = require("../models/user.model");
const { setUser } = require("./auth.service"); // adjust path

// Signup logic
async function signup({ name, email, password }) {
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
async function login({ email, password }) {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("Invalid email or password");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Invalid email or password");
  }

  const token = setUser(user);
  return { user, token };
}

module.exports = {
  signup,
  login,
};
