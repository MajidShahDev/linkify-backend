const nanoId = require("nano-id");
const URL = require("../models/url.model.js");

// Generate a new short URL
async function generateShortUrl(userId, originalUrl) {
  if (!originalUrl) throw new Error("URL is required");

  const shortId = nanoId(8);

  const urlEntry = await URL.create({
    shortId,
    redirectURL: originalUrl,
    visitHistory: [],
    createdBy: userId,
  });

  return urlEntry;
}

// Get URL by shortId and record visit
async function recordVisit(shortId) {
  const entry = await URL.findOneAndUpdate(
    { shortId },
    {
      $push: { visitHistory: { timestamp: Date.now() } },
    },
    { new: true }
  );

  if (!entry) throw new Error("Short URL not found");

  return entry;
}

// Get analytics
async function getAnalytics(shortId) {
  const entry = await URL.findOne({ shortId });
  if (!entry) throw new Error("Short URL not found");

  return {
    totalClicks: entry.visitHistory.length,
    analytics: entry.visitHistory,
  };
}

// Delete URL
async function deleteShortUrl(userId, shortId) {
  const entry = await URL.findOne({ shortId });
  if (!entry) throw new Error("Short URL not found");

  // Only creator can delete
  if (entry.createdBy.toString() !== userId.toString()) {
    throw new Error("You are not allowed to delete this URL");
  }

  await URL.deleteOne({ shortId });

  return shortId;
}

module.exports = {
  generateShortUrl,
  recordVisit,
  getAnalytics,
  deleteShortUrl,
};
