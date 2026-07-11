import express from "express";
import { restrictTo } from "../middlewares/auth.middleware.js";

import {
  handlePaymentSuccess,
  handlePaymentCancel,
  handleCreateCheckoutSession,
  handleCustomerPortal,
  handleStripeWebhook,
} from "../controllers/payment.controller.js";

const router = express.Router();

router.get("/success", handlePaymentSuccess);
router.get("/cancel", handlePaymentCancel);

router.get("/upgrade", (req, res) => {
  return res.render("payments/upgrade", {});
});

router.post(
  "/create-checkout-session",
  restrictTo(["USER", "ADMIN"]),
  handleCreateCheckoutSession
);

router.post(
  "/customer-portal",
  restrictTo(["USER", "ADMIN"]),
  handleCustomerPortal
);

router.post("/webhook", handleStripeWebhook);

export default router;
