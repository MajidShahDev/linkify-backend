import jwt from "jsonwebtoken";
import crypto from "crypto";

// Generate signed OAuth state
export function generateOAuthState(req, res, next) {
  try {
    req.oauthState = jwt.sign(
      { nonce: crypto.randomUUID() },
      process.env.STATE_SECRET,
      { expiresIn: "5m" }
    );
      console.log("oauth state generated successfully", req.oauthState);
    next();
  } catch (err) {
    next(err);
  }
}

// Verify OAuth state
export function verifyOAuthState(req, res, next) {
  try {
    const state = req.query.state;
    if (!state) return res.status(400).json({ error: "Missing state" });

    jwt.verify(state, process.env.STATE_SECRET);
    next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid or expired state" });
  }
}