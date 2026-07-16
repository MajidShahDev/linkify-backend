import User from "../models/user.model.js";
import { appLogger } from "../config/logger.js";

async function handleCheckoutCompleted(session) {
  const userId = session.metadata?.userId;

  if (!userId || !session.subscription) {
    throw new Error("Checkout session missing userId or subscription ID");
  }

  await User.findByIdAndUpdate(userId, {
    "subscription.plan": "PRO",
    "subscription.status": "active",
    "subscription.stripeSubscriptionId": session.subscription,
  });

  appLogger.info("User upgraded to PRO", {
    userId,
    subscriptionId: session.subscription,
  });
}

async function handleSubscriptionUpdated(subscription) {
  await User.findOneAndUpdate(
    {
      "subscription.stripeSubscriptionId": subscription.id,
    },
    {
      "subscription.status": subscription.status,
      "subscription.currentPeriodEnd": new Date(
        subscription.current_period_end * 1000
      ),
    }
  );

  appLogger.info("Subscription updated", {
    subscriptionId: subscription.id,
    status: subscription.status,
  });
}

async function handleSubscriptionDeleted(subscription) {
  await User.findOneAndUpdate(
    {
      "subscription.stripeSubscriptionId": subscription.id,
    },
    {
      "subscription.plan": "FREE",
      "subscription.status": "cancelled",
      "subscription.currentPeriodEnd": null,
      "subscription.stripeSubscriptionId": null,
    }
  );

  appLogger.info("Subscription cancelled", {
    subscriptionId: subscription.id,
  });
}

async function handleInvoicePaymentFailed(invoice) {
  await User.findOneAndUpdate(
    {
      "subscription.stripeCustomerId": invoice.customer,
    },
    {
      "subscription.status": "past_due",
    }
  );

  appLogger.warn("Subscription payment failed", {
    customerId: invoice.customer,
  });
}

async function handleInvoicePaid(invoice) {
  await User.findOneAndUpdate(
    {
      "subscription.stripeCustomerId": invoice.customer,
    },
    {
      "subscription.status": "active",
    }
  );

  appLogger.info("Subscription payment received", {
    customerId: invoice.customer,
  });
}

const handlers = {
  "checkout.session.completed": handleCheckoutCompleted,
  "customer.subscription.updated": handleSubscriptionUpdated,
  "customer.subscription.deleted": handleSubscriptionDeleted,
  "invoice.payment_failed": handleInvoicePaymentFailed,
  "invoice.paid": handleInvoicePaid,
};

export async function processWebhookEvent(event) {
  const handler = handlers[event.type];

  if (!handler) {
    appLogger.info("Unhandled Stripe webhook event", {
      event: event.type,
    });
    return;
  }

  await handler(event.data.object);
}
