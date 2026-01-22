import express from "express";
import { body } from "express-validator";
import {
  handleGenerateNewShortUrl,
  handleGetAnalytics,
  handleDeleteShortUrl,
} from "../controllers/url.controller.js";

const router = express.Router();



router.post(
  "/",
  [
    body("url")
      .notEmpty()
      .withMessage("URL is required")
      .isURL({ require_protocol: true })
      .withMessage("Please enter a valid URL with http:// or https://")
  ],
  handleGenerateNewShortUrl
);

// router.post("/", handleGenerateNewShortUrl);
router.get("/analytics/:shortId", handleGetAnalytics);
router.delete("/:shortId", handleDeleteShortUrl);


export default router;
