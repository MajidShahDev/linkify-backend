import { nanoid } from "nanoid";
import URL from "../models/url.model.js";
import Counter from "../models/counter.model.js"
import geoip from "geoip-lite";
import { encodeShortId } from "../utils/base62.js";

// Generate a new short URL
// export async function createShortUrl(userId, originalUrl) {
//   if (!originalUrl) throw new Error("URL is required");

//   const shortId = nanoid(8);

//   const urlEntry = await URL.create({
//     shortId,
//     redirectURL: originalUrl,
//     visitHistory: [],
//     createdBy: userId,
//   });

//   return urlEntry;
// }

export async function createShortUrl(userId, originalUrl) {
  if (!originalUrl) throw new Error("URL is required");

  // 1️⃣ Get next auto-increment ID
  const urlCounter = await Counter.findByIdAndUpdate(
    { _id: "url" },
    { $inc: { seq: 1 } },
    { upsert: true, new: true }
  );

  const numericId = urlCounter.seq;

  // 2️⃣ Encode ID into Base62 shortId
  const shortId = encodeShortId(numericId);

  // 3️⃣ Save to DB
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
// export async function getAnalytics(shortId) {
//   const entry = await URL.findOne({ shortId });
//   if (!entry) throw new Error("Short URL not found");

//   return {
//     totalClicks: entry.visitHistory.length,
//     analytics: entry.visitHistory,
//   };
// }
// export async function getAnalytics(shortId, timeRange) {

//   const url = await URL.findOne({ shortId });

//   if (!url) throw new Error("Not found");

//   const now = new Date();
//   let filteredVisits = url.visitHistory;

//   if (timeRange === "24h") {
//     const last24h = new Date(now - 24 * 60 * 60 * 1000);
//     filteredVisits = url.visitHistory.filter(
//       visit => visit.timestamp >= last24h
//     );
//   }

//   if (timeRange === "7d") {
//     const last7d = new Date(now - 7 * 24 * 60 * 60 * 1000);
//     filteredVisits = url.visitHistory.filter(
//       visit => visit.timestamp >= last7d
//     );
//   }

//   if (timeRange === "30d") {
//     const last30d = new Date(now - 30 * 24 * 60 * 60 * 1000);
//     filteredVisits = url.visitHistory.filter(
//       visit => visit.timestamp >= last30d
//     );
//   }

//   return {
//     totalClicks: filteredVisits.length,
//     analytics: filteredVisits
//   };
// }

export async function getAnalytics(shortId, timeRange, page = 1, limit = 15) {
  const url = await URL.findOne({ shortId }, "visitHistory"); // only need visitHistory

  if (!url) throw new Error("Not found");

  const now = new Date();
  let filteredVisits = url.visitHistory;

  if (timeRange === "24h") {
    const last24h = new Date(now - 24 * 60 * 60 * 1000);
    filteredVisits = filteredVisits.filter(visit => visit.timestamp >= last24h);
  } else if (timeRange === "7d") {
    const last7d = new Date(now - 7 * 24 * 60 * 60 * 1000);
    filteredVisits = filteredVisits.filter(visit => visit.timestamp >= last7d);
  } else if (timeRange === "30d") {
    const last30d = new Date(now - 30 * 24 * 60 * 60 * 1000);
    filteredVisits = filteredVisits.filter(visit => visit.timestamp >= last30d);
  }

  const totalClicks = filteredVisits.length;
  const totalPages = Math.ceil(totalClicks / limit);
  const skip = (page - 1) * limit;

  const paginatedVisits = filteredVisits.slice(skip, skip + limit);

  return {
    totalClicks,
    analytics: paginatedVisits,
    currentPage: page,
    totalPages
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

  // Escape regex for safe search
  function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  // Unescape URL for display
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

  // Sorting options
  let sortOption;
  switch (sort) {
    case "oldest":
      sortOption = { createdAt: 1 };
      break;
    case "newest":
      sortOption = { createdAt: -1 };
      break;
    case "mostClicks":
      sortOption = { clicks: -1, createdAt: -1 }; // total clicks
      break;
    case "leastClicks":
      sortOption = { clicks: 1, createdAt: -1 };
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
  };
}
