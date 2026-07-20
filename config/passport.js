import passport from "passport";
import GoogleStrategy from "passport-google-oauth20";
import User from "../models/user.model.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BASE_URL}/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if Google ID already exists
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          // Check if email already exists (local signup)
          const existingEmailUser = await User.findOne({
            email: profile.emails[0].value,
          });

          if (existingEmailUser) {
            // Link Google account to existing user
            existingEmailUser.googleId = profile.id;
            existingEmailUser.provider = "google";
            user = await existingEmailUser.save();
          } else {
            // Create new Google user
            user = await User.create({
              name: profile.displayName,
              email: profile.emails[0].value,
              googleId: profile.id,
              provider: "google",
              password: null,
              isEmailVerified: true,
            });
          }
        }
        return done(null, user);
      } catch (err) {
        return done(err, null); //
      }
    }
  )
);

export default passport;
