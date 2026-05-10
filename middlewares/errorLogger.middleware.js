import { appLogger } from "../config/logger.js";
import * as Sentry from "@sentry/node";

export default function errorMiddleware(err, req, res, next) {
  let severity = "medium";

  if (err.name === "ValidationError") {
    severity = "low";
  } else if (err.name === "MongoServerError") {
    severity = "critical";
  } else if (!err.statusCode || err.statusCode >= 500) {
    severity = "critical";
  }

  const statusCode = err.statusCode || 500;

  // Sentry (error tracking)
  Sentry.captureException(err, {
    tags: {
      severity,
      type: "express-error",
      route: req.originalUrl,
      method: req.method,
      statusCode,
    },
    extra: {
      body: req.body,
      params: req.params,
      query: req.query,
    },
  });

  // Winston (local logs)
  appLogger.error({
    type: "express-error",
    severity,
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    statusCode,
  });

  // response
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
}
