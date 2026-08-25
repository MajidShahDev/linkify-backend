import Url from "../models/url.model.js";
import User from "../models/user.model.js";
import { SUBSCRIPTION_PLANS } from "../config/subscriptionPlans.js";
import AppError from "../utils/AppError.js";

export async function getUserPlan(userId) {
  const user = await User.findById(userId);

  if (
    user?.subscription?.plan === "PRO" &&
    user.subscription.status === "active"
  ) {
    return SUBSCRIPTION_PLANS.PRO;
  }

  return SUBSCRIPTION_PLANS.FREE;
}

export async function checkCustomAliasQuota(userId) {
  const plan = await getUserPlan(userId);

  if (plan.limits.customAliases === Infinity) {
    return;
  }

  const totalCustomAliases = await Url.countDocuments({
    createdBy: userId,
    customAlias: {
      $exists: true,
      $ne: "",
    },
  });

  if (totalCustomAliases >= plan.limits.customAliases) {
    throw new AppError(
      `Your ${plan.name} plan allows only ${plan.limits.customAliases} custom aliases. Upgrade to Pro for unlimited custom aliases.`,
      400
    );
  }
}

export async function hasFeature(userId, feature) {
  const plan = await getUserPlan(userId);

  return Boolean(plan.features[feature]);
}