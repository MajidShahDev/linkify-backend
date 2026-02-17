
import express from "express";
import { body } from "express-validator";
import qrService from "qrcode";
import URL from "../models/url.model.js";
import { analyticsLimiter, createShortUrlLimiter } from "../middlewares/rateLimiter.js";
import {
  handleCreateNewShortUrl,
  handleGetAnalytics,
  handleDeleteShortUrl,
  handleEditOriginalUrl,
} from "../controllers/url.controller.js";

// fdsfdsdsfdsfdsfds
const router = express.Router();



router.post(
  "/",
  createShortUrlLimiter,
  [
    body("url")
      .notEmpty()
      .withMessage("URL is required")
      .isURL({ require_protocol: true })
      .withMessage("Please enter a valid URL with http:// or https://")
  ],
  handleCreateNewShortUrl
);

// router.post("/", handleGenerateNewShortUrl);
router.get("/analytics/:shortId",analyticsLimiter, handleGetAnalytics);
router.delete("/:shortId", handleDeleteShortUrl);
router.put("/:shortId", handleEditOriginalUrl);


router.get("/qr/:shortId", async (req, res) => {
  const shortId = req.params.shortId;
  const fullUrl = `${process.env.BASE_URL}/${shortId}`;

  const qr = await qrService.toDataURL(fullUrl); // Generates base64 image, actual QR code image generation.
  // const qr = await QRCode.toDataURL(fullUrl);

  res.json({ qr });
});

// router.get('/dashboard', async (req, res) => {
//   // Fetch all URLs
//   const urls = await URL.find();

//   // Total URLs and total clicks
//   const totalUrls = urls.length;
//   const totalClicks = urls.reduce((sum, url) => sum + url.visitHistory.length, 0);

//   // Collect clicks by day (format: YYYY-MM-DD)
//   const clicksByDate = {};
//   urls.forEach(url => {
//     url.visitHistory.forEach(v => {
//       const date = new Date(v.timestamp);
//       const key = date.toISOString().split('T')[0]; // '2026-02-17'
//       clicksByDate[key] = (clicksByDate[key] || 0) + 1;
//     });
//   });

//   // Sort dates for the graph
//   const sortedDates = Object.keys(clicksByDate).sort((a, b) => new Date(a) - new Date(b));
//   const labels = sortedDates.map(d => {
//     const dateObj = new Date(d);
//     return dateObj.toLocaleDateString('en-GB', { day:'2-digit', month:'short' }); // '17 Feb'
//   });
//   const data = sortedDates.map(d => clicksByDate[d]);

//   // Render dashboard
//   res.render('dashboard', { 
//     baseUrl: process.env.BASE_URL || 'http://localhost:3000',
//     totalUrls,
//     totalClicks,
//     activity: { labels, data }  // Only send chart data, no recentUrls
//   });
// });

router.get('/dashboard', async (req, res) => {
  const urls = await URL.find();

  // Get time range from query, default to 'all'
  const timeRange = req.query.time || 'all';

  const now = new Date();
  let startDate;

  if (timeRange === '24h') {
    startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  } else if (timeRange === '7d') {
    startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  } else if (timeRange === '30d') {
    startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  // Filter clicks based on time range
  const filteredUrls = urls.map(url => {
    const visits = url.visitHistory.filter(v => {
      if (!startDate) return true; // 'all' time
      return new Date(v.timestamp) >= startDate;
    });
    return { ...url.toObject(), visitHistory: visits };
  });

  // Total clicks after filter
  const totalClicks = filteredUrls.reduce((sum, url) => sum + url.visitHistory.length, 0);
  const totalUrls = urls.length;

  // Collect clicks by day
  const clicksByDate = {};
  filteredUrls.forEach(url => {
    url.visitHistory.forEach(v => {
      const date = new Date(v.timestamp);
      const key = date.toISOString().split('T')[0];
      clicksByDate[key] = (clicksByDate[key] || 0) + 1;
    });
  });

  const sortedDates = Object.keys(clicksByDate).sort((a,b) => new Date(a) - new Date(b));
  const labels = sortedDates.map(d => {
    const dateObj = new Date(d);
    return dateObj.toLocaleDateString('en-GB', { day:'2-digit', month:'short' });
  });
  const data = sortedDates.map(d => clicksByDate[d]);

  res.render('dashboard', {
    baseUrl: process.env.BASE_URL || 'http://localhost:3000',
    totalUrls,
    totalClicks,
    activity: { labels, data },
    timeRange // send to EJS to set selected option
  });
});





export default router;