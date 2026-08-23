export default function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const status = err.status || "error";

  const message =
    statusCode >= 500 && process.env.NODE_ENV === "production"
      ? "Something went wrong. Please try again later."
      : err.message || "Internal Server Error";

  if (req.accepts("html")) {
    const allowedPages = [400, 403, 404, 500];
    const page = allowedPages.includes(statusCode) ? statusCode : 500;

    return res.status(statusCode).render(`errors/${page}`, {
      statusCode,
      message,
    });
  }

  return res.status(statusCode).json({
    success: false,
    status,
    message,
  });
}