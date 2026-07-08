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