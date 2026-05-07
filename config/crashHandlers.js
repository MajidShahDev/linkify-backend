import { appLogger } from "./logger.js";

// uncaughtException watches synchronous errors
// that are NOT caught with try/catch anywhere in the call stack
process.on("uncaughtException", (err) => {
  appLogger.error({
    type: "uncaughtException",
    message: err.message,
  });

  console.error("Uncaught Exception! Shutting down...");

  setTimeout(() => {
    process.exit(1);
  }, 500);
});

// unhandledRejection watches Promise rejections
// that are NOT handled with .catch() or try/catch (in async/await)
process.on("unhandledRejection", (reason, promise) => {
  appLogger.error({
    type: "unhandledRejection",
    message: reason?.message || reason,
  });

  console.error("Unhandled Rejection! Shutting down...");
  setTimeout(() => {
    process.exit(1);
  }, 500);
});
