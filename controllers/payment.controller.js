import User from "../models/user.model.js";
import { createCheckoutSession } from "../services/payment.service.js";

export async function handleCreateCheckoutSession(req, res, next) {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const checkoutUrl = await createCheckoutSession(user);

    return res.status(200).json({
      url: checkoutUrl,
    });
  } catch (err) {
    next(err);
  }
}