import { validationResult } from "express-validator";
import {
  generateShortUrl,
  recordVisit,
  getAnalytics,
  deleteShortUrl,
} from "../services/url.service.js"; // adjust path

// Generate a new short URL and render home
// async function handleGenerateNewShortUrl(req, res) {
//   try {
//     const urlEntry = await generateShortUrl(req.user._id, req.body.url);

//     return res.render("home", { id: urlEntry.shortId });
//   } catch (err) {
//     console.error(err.message);
//     return res.status(400).json({ error: err.message });
//   }
// }

export async function handleGenerateNewShortUrl(req, res) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).render("home", {
      errors: errors.array().map((err) => err.msg), // array of messages
      oldInput: { url: req.body.url }, // keep the input filled
    });
  }

  try {
    const urlEntry = await generateShortUrl(req.user._id, req.body.url);
    return res.render("home", {
      id: urlEntry.shortId,
      errors: {}, // always define errors
      oldInput: {}, // optional, empty after success
    });
  } catch (err) {
    return res.status(400).render("home", {
      errors: [err.message],
      oldInput: { url: req.body.url },
    });
  }
}

// Redirect to original URL
export async function handleRedirectToOrignalURL(req, res) {
  try {
    const entry = await recordVisit(req.params.shortId);
    return res.redirect(entry.redirectURL);
  } catch (err) {
    console.error(err.message);
    return res.status(404).send(err.message);
  }
}

// Get analytics
export async function handleGetAnalytics(req, res) {
  try {
    const analytics = await getAnalytics(req.params.shortId);
    return res.json(analytics);
  } catch (err) {
    console.error(err.message);
    return res.status(404).json({ error: err.message });
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

// const nanoId = require("nano-id");
// const URL = require("../models/url.model.js");

// async function handleGenerateNewShortUrl(req, res) {
//   const body = req.body;
//   if (!body.url) return res.status(400).json({ error: "url is required" });
//   const shortID = nanoId(8);

//   await URL.create({
//     shortId: shortID,
//     redirectURL: body.url,
//     visitHistory: [],
//     createdBy: req.user._id,
//   });

//   // return res.json({ id: shortID });
//   return res.render("home", {
//     id: shortID,
//   });
// }

// async function handleRedirectToOrignalURL(req, res) {
//   const shortId = req.params.shortId;
//   const entry = await URL.findOneAndUpdate(
//     {
//       shortId,
//     },
//     {
//       $push: {
//         visitHistory: {
//           timestamp: Date.now(),
//         },
//       },
//     },
//     { new: true } // After updating the document, give me the UPDATED version, not the old one.
//   );

//   if (!entry) {
//     res.status(404).send("Short URL not found");
//   }
//   res.redirect(entry.redirectURL);
// }

// async function handleGetAnalytics(req, res) {
//   const shortId = req.params.shortId;
//   const result = await URL.findOne({ shortId });
//   if (!result) {
//     return res.status(404).send("Short URL not found");
//   }
//   return res.json({
//     totoalClicks: result.visitHistory.length,
//     analytics: result.visitHistory,
//   });
// }

// async function handleDeleteShortUrl(req, res) {
//   try {
//     const shortId = req.params.shortId;
//     const entry = await URL.findOne({ shortId });

//     if (!entry) {
//       return res.status(404).json({ error: "Short URL not found" });
//     }

//     // Optional: Check if the user deleting it is the creator
//     if (entry.createdBy.toString() !== req.user._id.toString()) {
//       return res
//         .status(403)
//         .json({ error: "You are not allowed to delete this URL" });
//     }

//     // Delete the URL
//     await URL.deleteOne({ shortId });

//     // Respond
//     return res.json({ message: "Short URL deleted successfully", shortId });
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ error: "Server error" });
//   }
// }

// module.exports = {
//   handleGenerateNewShortUrl,
//   handleRedirectToOrignalURL,
//   handleGetAnalytics,
//   handleDeleteShortUrl,
// };
