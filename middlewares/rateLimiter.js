import rateLimit from "express-rate-limit";
// import { getHomePageData } from "../services/url.service.js";

// General limiter for signup, verify email, resend verification,
export const generalAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // max 5 requests per window per IP
  message: {
    error: "Too many requests. Please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});


// Login limiter (more strict)
// export const loginLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 5,
//   message: {
//     error: "Too many login attempts. Please try again after 15 minutes.",
//   },
//   standardHeaders: true,
//   legacyHeaders: false,
// });

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // max 5 login attempts per IP
  standardHeaders: true,
  legacyHeaders: false,
  handler: async (req, res) => {
    // Optional: if you need data to render login page
    // const data = await getLoginPageData?.(req.query) || {};

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

// // Forgot password & reset password limiter
// export const passwordLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 5,
//   message: {
//     error: "Too many password requests. Try again after 15 minutes.",
//   },
//   standardHeaders: true,
//   legacyHeaders: false,
// });

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
        general: ["Too many password requests. Try again after 15 minutes."]
      },
      oldInput: { email: req.body?.email || "" },
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

// Create URL limiter: 10–20 requests per minute
// export const createShortUrlLimiter = rateLimit({
//   windowMs: 60 * 1000, // 1 minute
//   max: 5,
//   message: {
//     error: "Too many URL creation requests. Please try again later.",
//   },
//   standardHeaders: true,
//   legacyHeaders: false,
// });

export const createShortUrlLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 25,
  standardHeaders: true,
  legacyHeaders: false,
  handler: async (req, res) => {
    // Fetch current homepage data so template works
    // const data = await getHomePageData(req.user, req.query);

    return res.status(429).render("home", {
      ...data,
      errors: ["Too many URL creation requests. Please try again later."],
      oldInput: { url: req.body.url || "" },
      id: null,
    });
  },
});

// | Route Type | Example        | Limit             |
// | ---------- | -------------- | ----------------- |
// | Login      | `/login`       | 5–10 req / 15 min |
// | Signup     | `/signup`      | 3–5 req / hour    |
// | Redirect   | `/:shortId`    | 100–500 / minute  |
// | Analytics  | `/analytics`   | 30–60 / minute    |
// | Create URL | `/urls/create` | 10–20 / minute    |
// | uploadImg  | `/upload`      | 5-10 req / hour   |
