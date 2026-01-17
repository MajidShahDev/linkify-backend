const jwt = require("jsonwebtoken");

const secretKey = process.env.JWT_SECRET;

function setUser(user) {
  const payload = {
    _id: user._id,
    role: user.role,
    email: user.email,
  };
  return jwt.sign(payload, secretKey);
}

function getUser(token) {
  if (!token) return null;
  try {
    return jwt.verify(token, secretKey);
  } catch (err) {
    return null;
  }
}

module.exports = {
  setUser,
  getUser,
};


