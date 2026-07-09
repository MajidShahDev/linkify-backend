export const SUBSCRIPTION_PLANS = {
  FREE: {
    name: "FREE",

    limits: {
      customAliases: 3,
      shortLinks: Infinity,
    },

    features: {
      analytics: false,
    },
  },

  PRO: {
    name: "PRO",

    limits: {
      customAliases: Infinity,
      shortLinks: Infinity,
    },

    features: {
      analytics: true,
    },
  },
};