import { getPendingUrl, deletePendingUrl } from "./pendingUrl.service.js";
import { createShortUrl } from "./url.service.js";

export async function processLoginContinuation(user, continueToken) {
  if (!continueToken) {
    return null;
  }

  const pendingUrl = await getPendingUrl(continueToken);

  if (!pendingUrl) {
    return null;
  }

  const urlEntry = await createShortUrl(
    user._id,
    pendingUrl.originalUrl,
    pendingUrl.expiresAt,
    pendingUrl.customAlias
  );

  await deletePendingUrl(continueToken);

  return urlEntry;
}