const RESERVED_ALIASES = new Set([
  // Authentication
  "login",
  "logout",
  "signup",
  "register",
  "verify",
  "forgot-password",
  "reset-password",

  // User
  "profile",
  "settings",
  "account",

  // Dashboard
  "dashboard",
  "analytics",

  // API
  "api",

  // Admin
  "admin",

  // System
  "health",
  "status",

  // Static assets
  "favicon.ico",
  "robots.txt",
  "sitemap.xml",

  // Common routes
  "home",
  "about",
  "contact",
  "help",
  "pricing",
  "terms",
  "privacy",

  // URL features
  "qr",

  // Error pages
  "404",
  "500",
]);

export default RESERVED_ALIASES;