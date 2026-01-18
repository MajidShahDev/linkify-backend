// middlewares/tokenRequired.js
const User = require("../models/user.model");

async function resetPasswordTokenRequired(req, res, next) {
  const { token } = req.params; // or req.query.token

  if (!token) {
    return res.status(403).send("Access denied");
  }

  // Check if token exists in DB
  const user = await User.findOne({
    resetPasswordToken: token, // or emailVerificationToken
    resetPasswordExpires: { $gt: Date.now() }, // optional for expiration
  });

  if (!user) {
    return res.status(403).send("Invalid or expired link");
  }

  req.user = user; // pass user to next middleware
  next();
}


module.exports = { resetPasswordTokenRequired };
