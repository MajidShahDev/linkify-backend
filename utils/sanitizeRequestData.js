export default function sanitizeRequestData(data) {
  if (!data || typeof data !== "object") return data;

  const sensitiveFields = new Set([
    "password",
    "confirmPassword",
    "token",
    "accessToken",
    "refreshToken",
    "csrfToken",
    "code",
    "otp",
    "secret",
    "apiKey",
    "authorization",
    "cookie",
    "cardNumber",
    "cvv",
    "cvc",
  ]);

  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => [
      key,
      sensitiveFields.has(key) ? "[REDACTED]" : value,
    ])
  );
}