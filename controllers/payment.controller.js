import User from "../models/user.model.js";
import stripe from "../services/stripe.service.js";
import crypto from "crypto";
import { appLogger } from "../config/logger.js";
import { processWebhookEvent } from "../services/webhook.service.js";
import {
  createCheckoutSession,
  createCustomerPortal,
} from "../services/payment.service.js";
import AppError from "../utils/AppError.js";

export async function handleCreateCheckoutSession(req, res) {
  const user = await User.findById(req.user._id);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const cancelToken = crypto.randomBytes(32).toString("hex");

  req.session.paymentCancelToken = cancelToken;

  const checkoutUrl = await createCheckoutSession(user, cancelToken);

  return res.redirect(checkoutUrl);
}

export async function handleStripeWebhook(req, res) {
  const signature = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    appLogger.info("Stripe webhook received", {
      event: event.type,
    });
  } catch (err) {
    appLogger.error("Stripe webhook verification failed", {
      message: err.message,
      stack: err.stack,
    });

    return res.status(400).send("Stripe Webhook signature verification failed.");
  }

  try {
    await processWebhookEvent(event);

    return res.sendStatus(200);
  } catch (err) {
    appLogger.error("Stripe webhook processing failed", {
      event: event.type,
      message: err.message,
      stack: err.stack,
    });

    return res.sendStatus(500);
  }
}

export async function handleCustomerPortal(req, res) {
  const user = await User.findById(req.user._id);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (user.subscription.status !== "active") {
    return res.status(403).render("payments/upgrade");
  }

  const url = await createCustomerPortal(user);

  return res.redirect(url);
}

export async function handlePaymentSuccess(req, res) {
  const { session_id: sessionId } = req.query;

  if (!sessionId) {
    throw new AppError("Missing checkout session ID.", 400);
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (session.metadata?.userId !== req.user._id.toString()) {
    throw new AppError("Forbidden.", 403);
  }

  if (session.payment_status !== "paid") {
    throw new AppError("Payment has not been completed.", 400);
  }

  return res.render("payments/success");
}

export async function handlePaymentCancel(req, res) {
  const { token } = req.query;

  if (!token || token !== req.session.paymentCancelToken) {
    return res.status(403).render("errors/403");
  }

  delete req.session.paymentCancelToken;

  return res.render("payments/cancel");
}
