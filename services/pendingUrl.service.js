import crypto from "node:crypto";
import redis from "../config/redis.js";

const PENDING_URL_TTL = 600;

function generatePendingToken() {
  return crypto.randomBytes(32).toString("hex");
}

function getPendingUrlKey(token) {
  return `pending:url:${token}`;
}

function isValidPendingToken(token) {
  return typeof token === "string" && /^[a-f0-9]{64}$/.test(token);
}

export async function savePendingUrl({ originalUrl, expiresAt, customAlias }) {
  const token = generatePendingToken();

  const data = {
    originalUrl,
    expiresAt,
    customAlias,
  };

  await redis.set(
    getPendingUrlKey(token),
    JSON.stringify(data),
    "EX",
    PENDING_URL_TTL
  );

  return token;
}

export async function getPendingUrl(token) {
  if (!isValidPendingToken(token)) {
    return null;
  }

  const data = await redis.get(getPendingUrlKey(token));

  if (!data) {
    return null;
  }

  return JSON.parse(data);
}

export async function deletePendingUrl(token) {
  await redis.del(getPendingUrlKey(token));
}
