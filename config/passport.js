import passport from "passport";
import GoogleStrategy from "passport-google-oauth20";
import User from "../models/user.model.js";
// import { generateToken } from "../services/auth.service.js";

//Configuration = setup, settings, preparation.
// Think of configuration like assembling a tool before using it:

// Passport’s GoogleStrategy callback is meant to:
// Find or create the user in the database
// Pass the user to done(null, user)

// Then in the route handler (/auth/google/callback), we generate your JWT (or session cookie).

// Passport handles authentication logic separately
// Token generation happens in callback route only after authentication succeeds
// Keeps strategy reusable (you could reuse it for session-based auth too)

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BASE_URL}/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // 1️⃣ Check if Google ID already exists
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          // 2️⃣ Check if email already exists (local signup)
          const existingEmailUser = await User.findOne({
            email: profile.emails[0].value,
          });

          if (existingEmailUser) {
            // ⚠️ Option A: Link Google account to existing user
            existingEmailUser.googleId = profile.id;
            existingEmailUser.provider = "google";
            user = await existingEmailUser.save();
          } else {
            // ⚠️ Option B: Create new Google user
            user = await User.create({
              name: profile.displayName,
              email: profile.emails[0].value,
              googleId: profile.id,
              provider: "google",
              password: null, // optional for Google users
              isEmailVerified: true,
            });
          }
        }

        // 3️⃣ done > Passport finishes the middleware, express call next fn(route handler)
        return done(null, user);
      } catch (err) {
        return done(err, null); //
      }
    }
  )
);

export default passport;


// COMPLETE FLOW DIAGRAM

// User Clicks Login with Google
//         ↓
// GET /auth/google
//         ↓
// Redirect to Google
//         ↓
// User Logs In
//         ↓
// Google redirects → /auth/google/callback
//         ↓
// Passport Strategy Runs
//         ↓
// Check user
//         ↓
// Create or link account
//         ↓
// Generate JWT
//         ↓
// Set Cookie
//         ↓
// Redirect to "/"
//         ↓
// User Logged In
