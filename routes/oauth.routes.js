import express from "express";
import passport from "../config/passport.js";
import { generateToken } from "../services/auth.service.js";
import { processLoginContinuation } from "../services/loginContinuation.service.js";
import {
  generateOAuthState,
  verifyOAuthState,
} from "../middlewares/oauthState.middleware.js";

const router = express.Router();

router.get("/google", generateOAuthState, (req, res, next) => {
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "consent select_account", // forces user to choose account and confirm consent every time.
    session: false,
    state: req.oauthState,
  })(req, res, next); // calling the returned middleware from passport.authenticate immediately.
});

router.get(
  "/google/callback",
  verifyOAuthState,
  passport.authenticate("google", { session: false }),
  async (req, res) => {
    const token = generateToken(req.user);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    const urlEntry = await processLoginContinuation(
      req.user,
      req.oauthState.continueToken
    );

    if (!urlEntry) {
      return res.redirect("/");
    }

    return res.redirect(`/?created=${urlEntry.shortId}`);
  }
);

export default router;
