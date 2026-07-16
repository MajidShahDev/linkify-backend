import User from "../models/user.model.js";
import stripe from "../services/stripe.service.js";
import crypto from "crypto";
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

    const cancelToken = crypto.randomBytes(32).toString("hex");

    req.session.paymentCancelToken = cancelToken;

    const checkoutUrl = await createCheckoutSession(user, cancelToken);

    return res.redirect(checkoutUrl);
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

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.subscription.status !== "active") {
      return res.status(403).render("payments/upgrade");
    }

    const url = await createCustomerPortal(user);

    return res.redirect(url);
  } catch (err) {
    next(err);
  }
}

export async function handlePaymentSuccess(req, res, next) {
  try {
    const { session_id: sessionId } = req.query;

    if (!sessionId) {
      return res.status(400).render("errors/400");
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.metadata.userId !== req.user._id.toString()) {
      return res.status(403).render("errors/403");
    }

    if (session.payment_status !== "paid") {
      return res.status(400).render("errors/400");
    }

    return res.render("payments/success");
  } catch (err) {
    next(err);
  }
}

export async function handlePaymentCancel(req, res, next) {
  try {
    const { token } = req.query;

    if (!token || token !== req.session.paymentCancelToken) {
      return res.status(403).render("errors/403");
    }

    delete req.session.paymentCancelToken;

    return res.render("payments/cancel");
  } catch (err) {
    next(err);
  }
}
