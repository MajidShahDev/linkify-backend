import { validationResult } from "express-validator";
import { getHomePageData } from "../services/url.service.js";
import URL from "../models/url.model.js";
import {
  createShortUrl,
  recordVisit,
  getAnalytics,
  deleteShortUrl,
  editOriginalUrl,
} from "../services/url.service.js";
import AppError from "../utils/AppError.js";

export async function handleCreateNewShortUrl(req, res) {
  const errors = validationResult(req);
  const data = await getHomePageData(req.user, req.query);

  if (!errors.isEmpty()) {
    return res.status(400).render("home", {
      ...data,
      errors: errors.array().map((err) => err.msg),
      oldInput: { url: req.body.url, customAlias: req.body.customAlias },
      search: (req.query.search || "").trim(),
    });
  }

  try {
    const urlEntry = await createShortUrl(
      req.user._id,
      req.body.url,
      req.body.expiresAt,
      req.body.customAlias
    );

    // PRG
    return res.redirect("/?created=" + urlEntry.shortId);
  } catch (err) {
    if(err instanceof AppError){
      return res.status(err.statusCode).render("home", {
        ...data,
        errors: [err.message],
        oldInput: {
          url: req.body.url,
          expiresAt: req.body.expiresAt,
          customAlias: req.body.customAlias,
        },
        search: (req.query.search || "").trim(),
      });
    }
    throw err; // centralized error handler
  }
}

export async function handleRedirectToOrignalURL(req, res) {
  const entry = await recordVisit(req.params.shortId, req);

  return res.redirect(302, entry.redirectURL);
}

export async function handleGetAnalytics(req, res) {
  const { shortId } = req.params;

  const timeRange = req.query.time || "all";
  const page = parseInt(req.query.page) || 1; // pagination
  const limit = 15;

  const analyticsData = await getAnalytics(shortId, timeRange, page, limit);
  const baseUrl = process.env.BASE_URL || "https://localhost:8081";

  return res.render("analytics", {
    ...analyticsData,
    shortId,
    baseUrl,
    timeRange,
  });
}

export async function handleDeleteShortUrl(req, res) {
  const shortId = await deleteShortUrl(req.user._id, req.params.shortId);
  return res.json({ message: "Short URL deleted successfully", shortId });
}

export async function handleEditOriginalUrl(req, res) {
  const { shortId } = req.params;
  const { newUrl } = req.body;
  const updatedEntry = await editOriginalUrl(req.user._id, shortId, newUrl);
  return res.json({ message: "URL updated successfully", updatedEntry });
}
