import stripe from "./stripe.service.js";
import User from "../models/user.model.js";

export async function createOrGetCustomer(userId) {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  // Customer already exists
  if (user.subscription.stripeCustomerId) {
    return user.subscription.stripeCustomerId;
  }

  // Create a new Stripe customer
  const customer = await stripe.customers.create({
    name: user.name,
    email: user.email,
  });

  user.subscription.stripeCustomerId = customer.id;
  await user.save();

  return customer.id;
}

export async function createCheckoutSession(user) {
  const customerId = await createOrGetCustomer(user._id);

  if (
    user.subscription.plan === "PRO" &&
    user.subscription.status === "active"
  ) {
    throw new Error("You already have an active Pro subscription.");
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",

    customer: customerId,

    payment_method_types: ["card"],

    line_items: [
      {
        price: process.env.STRIPE_PRICE_ID,
        quantity: 1,
      },
    ],

    success_url: process.env.STRIPE_SUCCESS_URL,
    cancel_url: process.env.STRIPE_CANCEL_URL,

    metadata: {
      userId: user._id.toString(),
    },
  });

  return session.url;
}

export async function createCustomerPortal(user) {
  const customerId = await createOrGetCustomer(user._id);

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: process.env.BASE_URL + "/profile",
  });

  return session.url;
}