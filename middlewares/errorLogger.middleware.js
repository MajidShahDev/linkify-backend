import { appLogger } from "../config/logger.js";

export default function errorMiddleware(err, req, res, next) {
  appLogger.error({
    type: "express-error",
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
  });

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
}