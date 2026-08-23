import AppError from "../utils/AppError.js";

export default function notFound(req, res, next) {
  next(new AppError(`Route not found: ${req.originalUrl}`, 404));
}