import AppError from "../utils/AppError.js";
import { appLogger } from "../config/logger.js";
import * as Sentry from "@sentry/node";

function handleMongooseValidationError(err) {
  const message = Object.values(err.errors)
    .map((el) => el.message)
    .join(" ");

  return new AppError(message, 400);
}

function handleDuplicateKeyError(err) {
  const field = Object.keys(err.keyValue || {})[0];

  const value = err.keyValue?.[field];

  return new AppError(
    `Duplicate value "${value}" for field "${field}". Please use another value.`,
    409
  );
}

function handleCastError(err) {
  return new AppError(`Invalid ${err.path}: ${err.value}`, 400);
}

export default function errorHandler(err, req, res, next) {
  let error = err;

  // Mongoose validation error
  if (err.name === "ValidationError") {
    error = handleMongooseValidationError(err);
  }

  // MongoDB duplicate key error
  else if (err.code === 11000) {
    error = handleDuplicateKeyError(err);
  }

  // Mongoose invalid ObjectId
  else if (err.name === "CastError") {
    error = handleCastError(err);
  }

  const statusCode = error.statusCode || 500;
  const status = error.status || "error";

  const severity = error.isOperational ? "medium" : "critical";

  // Sentry
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

  // Winston
  appLogger.error({
    type: "express-error",
    severity,
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    statusCode,
  });

  // Here we dont expose technical details for unexpected production errors
  const message =
    statusCode >= 500 && process.env.NODE_ENV === "production"
      ? "Something went wrong. Please try again later."
      : error.message || "Internal Server Error";

  // HTML response
  if (req.accepts("html")) {
    const allowedPages = [400, 403, 404, 409, 500];
    const page = allowedPages.includes(statusCode) ? statusCode : 500;

    return res.status(statusCode).render(`errors/${page}`, {
      statusCode,
      message,
    });
  }

  // JSON response
  return res.status(statusCode).json({
    success: false,
    status,
    message,
  });
}
