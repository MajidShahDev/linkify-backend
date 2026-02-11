import { nanoid } from "nanoid";
import URL from "../models/url.model.js";
import geoip from "geoip-lite";

// Generate a new short URL
export async function createShortUrl(userId, originalUrl) {
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
export async function recordVisit(shortId, req) {
  const ip =
    req.ip || req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  const geo = geoip.lookup(ip); // returns country, city, region, etc.
  const entry = await URL.findOneAndUpdate(
    { shortId },
    {
      $inc: { clicks: 1 },
      $push: {
        visitHistory: {
          timestamp: Date.now(),
          ipAddress: req.ip,
          userAgent: req.get("User-Agent"),
          referrer: req.get("Referrer") || "Direct",
          location: geo
            ? `${geo.city || "Unknown"}, ${geo.country || "Unknown"}`
            : "Unknown",
        },
      },
    },
    { new: true }
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

// Edit original URL
export async function editOriginalUrl(userId, shortId, newUrl) {
  if (!newUrl) throw new Error("New URL is required");

  const entry = await URL.findOne({ shortId });
  if (!entry) throw new Error("Short URL not found");

  // Only creator can edit
  if (entry.createdBy.toString() !== userId.toString()) {
    throw new Error("You are not allowed to edit this URL");
  }

  entry.redirectURL = newUrl;
  await entry.save();

  return entry;
}

export async function getHomePageData(user, query) {
  const baseUrl = process.env.BASE_URL || "http://localhost:8081";
  const page = parseInt(query.page) || 1;
  const limit = 15;
  const skip = (page - 1) * limit;

  const search = (query.search || "").trim();
  const sort = query.sort || "newest";
  // const timeRange = query.time || "all";

  function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function unescapeUrl(escapedUrl) {
    return escapedUrl.replace(/\\([.*+?^${}()|[\]\/\\])/g, "$1");
  }

  const escapedSearch = escapeRegex(search);
  const shortIdSearch = escapedSearch.replace(
    new RegExp(`^${escapeRegex(baseUrl)}\/?`, "i"),
    ""
  );

  const filter = {
    createdBy: user._id,
    $or: [
      { redirectURL: { $regex: escapedSearch, $options: "i" } },
      { shortId: { $regex: shortIdSearch, $options: "i" } },
    ],
  };

  // let clickField;
  // switch (timeRange) {
  //   case "24h": clickField = "clicks24h"; break;
  //   case "7d": clickField = "clicks7d"; break;
  //   case "30d": clickField = "clicks30d"; break;
  //   case "all":
  //   default: clickField = "clicks";
  // }

  let sortOption;
  switch (sort) {
    case "oldest":
      sortOption = { createdAt: 1 };
      break;
    case "newest":
      sortOption = { createdAt: -1 };
      break;
    case "mostClicks":
      sortOption = { [clickField]: -1, createdAt: -1 };
      break;
    case "leastClicks":
      sortOption = { [clickField]: 1, createdAt: -1 };
      break;
    default:
      sortOption = { createdAt: -1 };
  }

  const totalUrls = await URL.countDocuments(filter);
  const allUrls = await URL.find(filter)
    .sort(sortOption)
    .skip(skip)
    .limit(limit);

  const displayUrls = allUrls.map((url) => ({
    ...url._doc,
    redirectURL: unescapeUrl(url.redirectURL),
  }));

  const totalPages = Math.ceil(totalUrls / limit);

  return {
    urls: displayUrls,
    baseUrl,
    currentPage: page,
    totalPages,
    search,
    sort,
    // timeRange
  };
}
