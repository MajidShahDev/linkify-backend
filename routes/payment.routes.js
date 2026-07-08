import { Router } from "express";

import { restrictTo } from "../middlewares/auth.middleware.js";

import {
  handleCreateCheckoutSession,
  handleStripeWebhook,
} from "../controllers/payment.controller.js";

const router = Router();

router.post(
  "/create-checkout-session",
  restrictTo(["USER", "ADMIN"]),
  handleCreateCheckoutSession
);

router.post("/webhook", handleStripeWebhook);

export default router;
