import User from "../models/user.model.js";
import stripe from "../services/stripe.service.js";
import { appLogger } from "../config/logger.js";
import { processWebhookEvent } from "../services/webhook.service.js";
import {
  createCheckoutSession,
  createCustomerPortal,
} from "../services/payment.service.js";

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

    return res.status(400).send(`Webhook Error: ${err.message}`);
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

export async function handleCustomerPortal(req, res, next) {
  try {
    const user = await User.findById(req.user._id);

    const url = await createCustomerPortal(user);

    return res.redirect(url);
  } catch (err) {
    next(err);
  }
}
