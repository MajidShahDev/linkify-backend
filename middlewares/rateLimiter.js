import rateLimit from "express-rate-limit";

export const generalAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // max 5 requests per window per IP
  message: {
    error: "Too many requests. Please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // max 5 login attempts per IP
  standardHeaders: true,
  legacyHeaders: false,
  handler: async (req, res) => {

    return res.status(429).render("auth/login", {
      // ...data,
      errors: {
        general: [
          "Too many login attempts. Please try again after 15 minutes.",
        ],
      },
      oldInput: { email: req.body?.email || "" }, // keep email input
    });
  },
});

export const passwordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: async (req, res) => {
    return res.status(429).render("auth/forgot-password", {
      message: null,
      error: null,
      errors: {
        general: ["Too many password requests. Try again after 15 minutes."],
      },
      oldInput: { email: req.body?.email || "" },
    });
  },
});

export const emailOtpSendLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 3, // max 2 OTP requests per IP
  standardHeaders: true,
  legacyHeaders: false,

  handler: async (req, res) => {
    return res.status(429).render("auth/verify-otp-email", {
      message: null,
      error: null,
      errors: {
        general: ["Too many OTP requests. Please try again after 10 minutes."],
      },
      info: null,
    });
  },
});

// Redirect limiter: 100–500 requests per minute
export const redirectLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 500,
  message: {
    error: "Too many redirects. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Analytics limiter: 30–60 requests per minute
export const analyticsLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60,
  message: {
    error: "Too many analytics requests. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const createShortUrlLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 25,
  standardHeaders: true,
  legacyHeaders: false,
  handler: async (req, res) => {
    return res.status(429).render("home", {
      ...data,
      errors: ["Too many URL creation requests. Please try again later."],
      oldInput: { url: req.body.url || "" },
      id: null,
    });
  },
});
