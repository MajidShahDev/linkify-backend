
import { appLogger } from "./logger.js";
import * as Sentry from "@sentry/node";

// uncaughtException watches synchronous errors
// that are NOT caught with try/catch anywhere in the call stack
process.on("uncaughtException", async (err) => {
  appLogger.error({
    type: "uncaughtException",
    message: err.message,
  });

  console.error("Uncaught Exception! Shutting down...");
  await Sentry.flush(1000);

  setTimeout(() => {
    process.exit(1);
  }, 500);
});

// unhandledRejection watches Promise rejections
// that are NOT handled with .catch() or try/catch (in async/await)
process.on("unhandledRejection", async (reason, promise) => {
  
  appLogger.error({
    type: "unhandledRejection",
    message: reason?.message || reason,
  });

  console.error("Unhandled Rejection! Shutting down...");
  await Sentry.flush(1000);

  setTimeout(() => {
    process.exit(1);
  }, 500);
});