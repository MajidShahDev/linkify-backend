const express = require("express");
const { body } = require("express-validator");
const {
  handleGenerateNewShortUrl,
  handleGetAnalytics,
  handleDeleteShortUrl,
} = require("../controllers/url.controller");
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


module.exports = router;
