import { validationResult } from "express-validator";
import URL from "../models/url.model.js";
import {
  generateShortUrl,
  recordVisit,
  getAnalytics,
  deleteShortUrl,
  editOriginalUrl
} from "../services/url.service.js"; // adjust path


export async function handleGenerateNewShortUrl(req, res) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).render("home", {
      errors: errors.array().map(err => err.msg),
      oldInput: { url: req.body.url },
      urls: await URL.find({ createdBy: req.user._id }),
    });
  }

  try {
    const urlEntry = await generateShortUrl(req.user._id, req.body.url);

    // PRG
    return res.redirect("/?created=" + urlEntry.shortId);
    // ?created=shortid // short id is passed as query parameter

  } catch (err) {
    return res.status(400).render("home", {
      errors: [err.message],
      oldInput: { url: req.body.url },
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
//     const analytics = await getAnalytics(req.params.shortId);
//     return res.json(analytics);
//   } catch (err) {
//     console.error(err.message);
//     return res.status(404).json({ error: err.message });
//   }
// }

export async function handleGetAnalytics(req, res) {
  try {
    const analyticsData = await getAnalytics(req.params.shortId);
      const baseUrl = process.env.BASE_URL || "http://localhost:8081";
    res.render("analytics", { ...analyticsData, shortId: req.params.shortId, baseUrl });
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

