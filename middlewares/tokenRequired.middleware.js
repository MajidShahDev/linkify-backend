// middlewares/tokenRequired.js
import User from "../models/user.model.js";

export async function resetPasswordTokenRequired(req, res, next) {
  const { token } = req.params; // or req.query.token

  if (!token) {
    return res.status(403).send("Access denied");
  }

  // Check if token exists in DB
  const user = await User.findOne({
    resetPasswordToken: token, 
    resetPasswordExpires: { $gt: Date.now() }, 
  });

  if (!user) {
    return res.status(403).send("Invalid or expired link");
  }

  req.user = user; // pass user to next middleware
  next();
}


