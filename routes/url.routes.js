
import express from "express";
import { body } from "express-validator";
import qrService from "qrcode";
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

export default router;