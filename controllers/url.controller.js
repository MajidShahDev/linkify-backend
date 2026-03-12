import { validationResult } from "express-validator";
import { getHomePageData } from "../services/url.service.js";
import URL from "../models/url.model.js";
import {
  createShortUrl,
  recordVisit,
  getAnalytics,
  deleteShortUrl,
  editOriginalUrl,
} from "../services/url.service.js"; // adjust path

export async function handleCreateNewShortUrl(req, res) {
  const errors = validationResult(req);
  const data = await getHomePageData(req.user, req.query);

  if (!errors.isEmpty()) {
    return res.status(400).render("home", {
      ...data,
      errors: errors.array().map((err) => err.msg),
      oldInput: { url: req.body.url },
      search: (req.query.search || "").trim(),
    });
  }

  try {
    const urlEntry = await createShortUrl(req.user._id, req.body.url);

    // PRG
    return res.redirect("/?created=" + urlEntry.shortId);
    // ?created=shortid // short id is passed as query parameter
  } catch (err) {
    return res.status(400).render("home", {
      ...data,
      errors: [err.message],
      oldInput: { url: req.body.url },
      search: (req.query.search || "").trim(),
      urls: await URL.find({ createdBy: req.user._id }),
    });
  }
}

// Redirect to original URL
export async function handleRedirectToOrignalURL(req, res) {
  try {
    const entry = await recordVisit(req.params.shortId, req);
    return res.redirect(entry.redirectURL);
  } catch (err) {
    console.error(err.message);
    return res.status(404).send(err.message);
  }
}

// Get analytics


// export async function handleGetAnalytics(req, res) {
//   try {
//     const analyticsData = await getAnalytics(req.params.shortId);
//     const baseUrl = process.env.BASE_URL || "http://localhost:8081";
//     res.render("analytics", {
//       ...analyticsData,
//       shortId: req.params.shortId,
//       baseUrl,
//     });
//   } catch (err) {
//     console.error(err.message);
//     return res.status(404).send("Short URL not found");
//   }
// }

// export async function handleGetAnalytics(req, res) {
//   try {
//     const { shortId } = req.params;

//     // ✅ Get time range from query string
//     const timeRange = req.query.time || "all";

//     const analyticsData = await getAnalytics(shortId, timeRange);

//     const baseUrl = process.env.BASE_URL || "http://localhost:8081";

//     res.render("analytics", {
//       ...analyticsData,
//       shortId,
//       baseUrl,
//       timeRange
//     });

//   } catch (err) {
//     console.error(err.message);
//     return res.status(404).send("Short URL not found");
//   }
// }

export async function handleGetAnalytics(req, res) {
  try {
    const { shortId } = req.params;

    const timeRange = req.query.time || "all";
    const page = parseInt(req.query.page) || 1; // pagination
    const limit = 15;

    const analyticsData = await getAnalytics(shortId, timeRange, page, limit);
    const baseUrl = process.env.BASE_URL || "http://localhost:8081";

    res.render("analytics", {
      ...analyticsData,
      shortId,
      baseUrl,
      timeRange
    });

  } catch (err) {
    console.error(err.message);
    return res.status(404).send("Short URL not found");
  }
}


// Delete URL
export async function handleDeleteShortUrl(req, res) {
  try {
    const shortId = await deleteShortUrl(req.user._id, req.params.shortId);
    return res.json({ message: "Short URL deleted successfully", shortId });
  } catch (err) {
    console.error(err.message);
    const status = err.message.includes("allowed") ? 403 : 404;
    return res.status(status).json({ error: err.message });
  }
}

export async function handleEditOriginalUrl(req, res) {
  const { shortId } = req.params;
  const { newUrl } = req.body;

  try {
    const updatedEntry = await editOriginalUrl(req.user._id, shortId, newUrl);
    return res.json({ message: "URL updated successfully", updatedEntry });
  } catch (err) {
    console.error(err.message);
    const status = err.message.includes("allowed") ? 403 : 404;
    return res.status(status).json({ error: err.message });
  }
}
