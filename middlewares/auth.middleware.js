import { getUser } from "../services/auth.service.js";

// reads token → loads user → attaches to req
// tryAuthenticateUser

export function tryAuthenticateUser(req, res, next) {
  req.user = null; // Default to unauthenticated; ensures req.user is always defined
  //               // Initialize default user state for authentication as null(unauthenticated.)
  //               // This ensures that if there is no token or invalid token after, req.user is always defined.
  const userToken = req.cookies?.token; //
  if (!userToken) return next();
  const user = getUser(userToken);
  req.user = user;
  return next();
}


export function restrictTo(roles = ["NORMAL", "ADMIN"]) {
  return function (req, res, next) {
    if (!req.user) return res.redirect("/login");
    if (!roles.includes(req.user.role)) return res.end("UnAuthorized");
    return next();
  };
}

// Both null and undefined cause runtime errors when accessing properties.
// But setting it to null:
// Ensure middleware ran successfully, but there is intentionally no authenticated user yet at start.
// Makes state intentional
// Makes debugging clearer
// Guarantees consistent structure
// Improves architectural quality
// Reduces hidden bugs

//////////////////////////////////////////////////////////////////////////
// deserializeUser = “Convert stored auth data (token/session) back into a usable user object for this request.”
//////////////////////////////////////////////////////////////////////////
// Serialize
// 👉 Convert a big object into a small storable value
// user object → user.id

// Deserialize
// 👉 Convert that small value back into the full object
// user.id → full user object

// Login time        → serialize user
// Request time      → deserialize user

//////////////////////////////////////////////////////////////////////////
// During login (serialize) You stored only a reference, not the full user.
// User logs in
// ↓
// Server creates token (JWT / session id)
// ↓
// Token is stored in cookie

//////////////////////////////////////////////////////////////////////////
// On every request (deserialize) You rebuilt the full user object from the stored token.
// Request comes in
// ↓
// Read token from cookie
// ↓
// Decode token
// ↓
// Find user from DB
// ↓
// Attach user to req.user
//////////////////////////////////////////////////////////////////////////
// What does service folder actually mean?

// Service = Business Logic Layer
// A service file exists to answer ONE question:
// “What should the system DO?”
// Not: how request comes, how response goes, how routing works
// Only rules + logic.

// Because they represent core system rules.
// services/
// ├── auth.service.js      ← identity rules
// ├── email.service.js     ← sending emails
// ├── payment.service.js  ← Stripe / Razorpay logic
// ├── url.service.js      ← URL creation rules
// ├── user.service.js     ← user-related logic
// Service folder exists to protect your app from becoming spaghetti 🍝

// Service files answer: “What should happen?”
// Controllers answer: “How HTTP should respond?”
