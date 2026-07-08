import User from "../models/user.model.js";

export async function requirePro(req, res, next) {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (
      user.subscription.plan !== "PRO" ||
      user.subscription.status !== "active"
    ) {
      return res.status(403).json({
        message: "This feature requires a Pro subscription.",
      });
    }

    next();
  } catch (err) {
    next(err);
  }
}