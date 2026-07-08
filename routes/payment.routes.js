import { Router } from "express";

import { restrictTo } from "../middlewares/auth.middleware.js";

import { handleCreateCheckoutSession } from "../controllers/payment.controller.js";

const router = Router();

router.post(
  "/create-checkout-session",
  restrictTo(["USER", "ADMIN"]),
  handleCreateCheckoutSession
);

export default router;