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

function handleStripeError(err) {
  switch (err.type) {
    case "StripeCardError":
      return new AppError(
        "Your card was declined. Please try another payment method.",
        402
      );

    case "StripeInvalidRequestError":
      return new AppError("Invalid payment request. Please try again.", 400);

    case "StripeAuthenticationError":
    case "StripePermissionError":
      return new AppError(
        "Payment service is temporarily unavailable. Please try again later.",
        503
      );

    case "StripeRateLimitError":
      return new AppError(
        "Too many payment requests. Please try again later.",
        429
      );

    case "StripeConnectionError":
    case "StripeAPIError":
      return new AppError(
        "Payment service is temporarily unavailable. Please try again later.",
        503
      );

    default:
      return new AppError(
        "Payment service error. Please try again later.",
        502
      );
  }
}

function handleRedisError(err) {
  return new AppError(
    "A temporary service error occurred. Please try again later.",
    503
  );
}

function isRedisError(err) {
  return (
    err?.name === "MaxRetriesPerRequestError" ||
    err?.code === "ECONNREFUSED" ||
    err?.code === "ECONNRESET"
  );
}

export default function errorHandler(err, req, res, next) {
  let error = err;

  if (err.name === "ValidationError") {
    error = handleMongooseValidationError(err);
  } else if (err.code === 11000) {
    error = handleDuplicateKeyError(err);
  } else if (err.name === "CastError") {
    error = handleCastError(err);
  } else if (err.type?.startsWith("Stripe")) {
    error = handleStripeError(err);
  } else if (isRedisError(err)) {
    error = handleRedisError(err);
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
    statusCode >= 500 &&
    process.env.NODE_ENV === "production" &&
    !error.isOperational
      ? "An unexpected server error occurred. Please try again later."
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
