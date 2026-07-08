import { Router } from "express";

import { restrictTo } from "../middlewares/auth.middleware.js";

import {
  handleCreateCheckoutSession,
  handleCustomerPortal,
  handleStripeWebhook,
} from "../controllers/payment.controller.js";

const router = Router();

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
