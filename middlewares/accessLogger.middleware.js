import { accessLogger } from "../config/logger.js";

export default function accessMiddleware(req, res, next) {
  const start = Date.now();

  res.on("finish", function () {
    const duration = Date.now() - start;

    accessLogger.info({
      type: "access",
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      responseTime: `${duration}ms`,
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });
  });

  next();
}