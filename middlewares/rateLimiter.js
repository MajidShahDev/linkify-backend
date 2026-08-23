import rateLimit from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import redis from "../config/redis.js";

// Per-User OTP limit (5 otp per 15 minute per user)
export const otpUserLimiter = async (req, res, next) => {
  try {
    const purpose = req.session.otp?.purpose;
    const userId = purpose === "login" ? req.session.tempUserId : req.user?._id;

    if (!userId) return next(); // let IP limiter handle it

    const key = `otp:ratelimit:user:${userId}`;
    const count = await redis.incr(key);
    if (count === 1) {
      await redis.expire(key, 15 * 60); // 15 minute window
    }

    if (count > 5) {
      const ttl = await redis.ttl(key);
      return res.status(429).render("auth/verify-otp-email", {
        message: null,
        error: null,
        errors: {
          general: [
            `Too many OTPs for this account. Wait ${ttl}s and try again.`,
          ],
        },
        info: null,
      });
    }
    next();
  } catch (err) {
    console.error("Redis rate limit error:", err);
    next(); // don't block if redis fails
  }
};

export const generalAuthLimiter = rateLimit({
  store: new RedisStore({ sendCommand: (...args) => redis.call(...args) }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // max 5 requests per window per IP
  message: {
    error: "Too many requests. Please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const loginLimiter = rateLimit({
  store: new RedisStore({ sendCommand: (...args) => redis.call(...args) }),
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
  store: new RedisStore({ sendCommand: (...args) => redis.call(...args) }),
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
  store: new RedisStore({
    sendCommand: (...args) => redis.call(...args),
    prefix: "otp:ratelimit:ip:",
  }),
  keyGenerator: (req) => req.ip,
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // max 15 OTP requests per IP
  standardHeaders: true,
  legacyHeaders: false,

  handler: async (req, res) => {
    return res.status(429).render("auth/verify-otp-email", {
      message: null,
      error: null,
      errors: {
        general: ["Too many OTP requests. Please try again after 15 minutes."],
      },
      info: null,
    });
  },
});

// Redirect limiter: 100–500 requests per minute
export const redirectLimiter = rateLimit({
  store: new RedisStore({ sendCommand: (...args) => redis.call(...args) }),
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
  store: new RedisStore({ sendCommand: (...args) => redis.call(...args) }),
  windowMs: 60 * 1000, // 1 minute
  max: 60,
  message: {
    error: "Too many analytics requests. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const createShortUrlLimiter = rateLimit({
  store: new RedisStore({ sendCommand: (...args) => redis.call(...args) }),
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
