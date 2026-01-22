import { nanoid } from "nanoid";
import URL from "../models/url.model.js";

// Generate a new short URL
export async function generateShortUrl(userId, originalUrl) {
  if (!originalUrl) throw new Error("URL is required");

  const shortId = nanoid(8);

  const urlEntry = await URL.create({
    shortId,
    redirectURL: originalUrl,
    visitHistory: [],
    createdBy: userId,
  });

  return urlEntry;
}

// Get URL by shortId and record visit
export async function recordVisit(shortId) {
  const entry = await URL.findOneAndUpdate(
    { shortId },
    {
      $push: { visitHistory: { timestamp: Date.now() } },
    },
    { new: true },
  );

  if (!entry) throw new Error("Short URL not found");

  return entry;
}

// Get analytics
export async function getAnalytics(shortId) {
  const entry = await URL.findOne({ shortId });
  if (!entry) throw new Error("Short URL not found");

  return {
    totalClicks: entry.visitHistory.length,
    analytics: entry.visitHistory,
  };
}

// Delete URL
export async function deleteShortUrl(userId, shortId) {
  const entry = await URL.findOne({ shortId });
  if (!entry) throw new Error("Short URL not found");

  // Only creator can delete
  if (entry.createdBy.toString() !== userId.toString()) {
    throw new Error("You are not allowed to delete this URL");
  }

  await URL.deleteOne({ shortId });

  return shortId;
}
