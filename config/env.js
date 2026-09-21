import { appLogger } from "./logger.js";

const requiredEnvVars = [
  "MONGO_URL",
  "PORT",
  "NODE_ENV",
  "JWT_SECRET",
  "EMAIL_USER",
  "EMAIL_PASS",
  "BASE_URL",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "STATE_SECRET",
  "OBFUSCATION_SECRET",
  "SENTRY_DSN",
  "SESSION_SECRET",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "STRIPE_PRICE_ID",
  "STRIPE_SUCCESS_URL",
  "STRIPE_CANCEL_URL",
  "REDIS_URL",
];

const missingEnvVars = requiredEnvVars.filter(
  (key) => !process.env[key]?.trim()
);

if (missingEnvVars.length > 0) {
  appLogger.error({
    type: "environment-validation",
    message: `Missing required environment variables: ${missingEnvVars.join(", ")}`,
  });

  process.exit(1);
}

const secretEnvVars = [
  "JWT_SECRET",
  "STATE_SECRET",
  "OBFUSCATION_SECRET",
  "SESSION_SECRET",
];

for (const key of secretEnvVars) {
  if (process.env[key].length < 32) {
    appLogger.error({
      type: "environment-validation",
      message: `${key} must be at least 32 characters long.`,
    });

    process.exit(1);
  }
}

const port = Number(process.env.PORT);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  appLogger.error({
    type: "environment-validation",
    message: "PORT must be a valid number between 1 and 65535.",
  });

  process.exit(1);
}

const allowedNodeEnvs = ["development", "production", "test"];

if (!allowedNodeEnvs.includes(process.env.NODE_ENV)) {
  appLogger.error({
    type: "environment-validation",
    message: `NODE_ENV must be one of: ${allowedNodeEnvs.join(", ")}.`,
  });

  process.exit(1);
}

const urlEnvVars = [
  "BASE_URL",
  "STRIPE_SUCCESS_URL",
  "STRIPE_CANCEL_URL",
];

for (const key of urlEnvVars) {
  try {
    new URL(process.env[key]);
  } catch {
    appLogger.error({
      type: "environment-validation",
      message: `${key} must be a valid URL.`,
    });

    process.exit(1);
  }
}