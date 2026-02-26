import express from "express";
import passport from "../config/passport.js";
import { setUser } from "../services/auth.service.js";
import {
  generateOAuthState,
  verifyOAuthState,
} from "../middlewares/oauthState.js";

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
  (req, res) => {
    const token = setUser(req.user);
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });
    res.redirect("/");
  }
);

export default router;

///////////////////////////////////////////////////////////////////////////////////////////////////

// router.get("/google", generateOAuthState, (req, res, next) => {
//     // console.log("oauth state generated successfully");
//     passport.authenticate("google", {
//         scope: ["profile", "email"],
//         prompt: "consent select_account",
//         session: false,
//         state: req.oauthState,
//   })(req, res, next); // we write passport.authenticate function inside another middleware so passport.authenticate can read
//                  // req.oauthState(generated earlier from generateOAuthState)
//                  // from wrapper middleware, so because passport.authenticate is inside another middleware and it doesnot
//                  // not execute immediately, its just a function, it returns middleware, we have to invoke(calling the returned function)
//                  // middleware manually with (req,res,next).
//                  // If you didn’t need dynamic state, you could do:
//                  // router.get("/google", passport.authenticate("google", { scope: ["profile"] }));
//                  // Example
//                  // const passportMiddleware = passport.authenticate("google", options);
//                  // passportMiddleware(req, res, next);  === passport.authenticate(...)(req, res, next);
// });

// Express register whatever function we pass in middleware position.
// If we call some function(like passport.authenticate) during route defination time when server starts.
// and that function returned some other function(call back function or middleware)
// that is what gets regestired as middleware.
// Javscript runs the function before express see it.

// Route Defination Time: When server Starts routes are registered and middleware and route handlers attached to them.
// Route Execution Time: When req comes middleware function and routes handlers are called and executed.

// There are two kinds of things you can pass to Express:
// Function(Middleware)
// Function(Middleware) that return another Function(Middleware)

// In Express, middleware is always registered at startup.
// Middleware can be configured statically or dynamically.
// Static configuration  = Middleware is fully configured at server startup.
// Dynamic configuration = Middleware is configured at per-request time using req.

//////////////////////////////////////////////////////////////////////////////////////////
// WHEN EXPRESS SERVER STARTS

// 1 JavaScript runs top to bottom
// 2 Database connection is established
// 3 Global middlewares are registered (attached to every route as the first middleware)
// 4 Routes are registered (route-specific middlewares + handlers are attached)
// 5 Routing table is built internally
// 6 Server begins listening on a port
// 7 Express waits for incoming requests and executes middleware/handlers when they arrive

//////////////////////////////////////////////////////////////////////////////////////////
// WHEN EXPRESS REQUEST COMES
// Client (browser, mobile app, curl) sends HTTP request
//        ↓
// Node.js HTTP server receives raw TCP packet → parses HTTP
//        ↓
// Node creates:
//    req = http.IncomingMessage
//    res = http.ServerResponse
//        ↓
// Express receives req/res → runs middleware stack
//        ↓
// Route-specific middleware → route handler
//        ↓
// Handler sends response via res → Node writes HTTP response back to client
//////////////////////////////////////////////////////////////////////////////////////////

// // Step 1 → redirect to Google

// router.get(
//   "/google",
//   passport.authenticate("google", {
//     scope: ["profile", "email"],
//     prompt: "consent select_account", // forces user to choose account and confirm consent every time.
//     //                                // "select_account" = forces account selection every time
//     //                                // Consent = the action where that user explicitly allows your app to access their data.
//   })
// );

// Step 2 → callback
// router.get(
//   "/google/callback",
//   passport.authenticate("google", { session: false }),
//   (req, res) => {
//     const token = setUser(req.user);

//     res.cookie("token", token, {
//       httpOnly: true, // prevents JS from reading it (good)
//       secure: false,
//       //   sameSite: "lax", // "lax" works for local dev
//       path: "/",
//       //   maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
//     });

//     res.redirect("/");
//   }
// );

// export default router;

// // Request → /google/callback
// //       |
// //       V
// // passport.authenticate("google")  ← middleware

// // -- Internally:
// //       |-- Handles the OAuth response from Google
// //       |-- Extracts profile info (id, email, name)
// //       |-- invokes GoogleStrategy callback
// //       |-- done(null, user)  ← sets req.user & tells Express to continue with next()
// //       V
// // (req, res) => { ... }  ← your route handler runs
// //                          can read req.user & Generate JWT, set cookie, redirect, etc.
