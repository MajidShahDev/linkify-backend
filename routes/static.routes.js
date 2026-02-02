import express from "express";
import URL from "../models/url.model.js";
import { restrictTo } from "../middlewares/auth.middleware.js";
import { resetPasswordTokenRequired } from "../middlewares/tokenRequired.middleware.js";

const router = express.Router();

// router.route("/").get(handleRedirectToOrignalURL);

router.get("/signup", async (req, res) => {
  return res.render("auth/signup", {
    errors: {},
    oldInput: {},
  });
});

router.get("/login", async (req, res) => {
  return res.render("auth/login", {
    errors: {},
    oldInput: {},
  });
});
router.get("/forgot-password", async (req, res) => {
  return res.render("auth/forgot-password", {
    message: null,
    error: null,
    oldInput: {},
  });
});

// Show reset password form
router.get("/reset-password/:token", resetPasswordTokenRequired, (req, res) => {
  const { token } = req.params;

  // Render your reset-password page with the token
  return res.render("auth/reset-password", {
    token, // needed in form action
    error: null, // no error initially
  });
});

router.get("/verify-email", async (req, res) => {
  return res.render("auth/verify-email", {
    message: null,
    error: null,
    info: null,
  });
});

router.get("/admin/url", restrictTo(["ADMIN"]), async (req, res) => {
  const allUrls = await URL.find({});
  return res.render("home", {
    urls: allUrls,
  });
});

router.get("/", restrictTo(["NORMAL", "ADMIN"]), async (req, res) => {
  // if(!req.user) return res.redirect('/login');
  const baseUrl = process.env.BASE_URL || "http://localhost:8081";
  // const allUrls = await URL.find({ createdBy: req.user._id }).sort({
  //   createdAt: -1,
  // });
  const page = parseInt(req.query.page) || 1; // current page
  const limit = 15; // urls per page
  const skip = (page - 1) * limit;

  const totalUrls = await URL.countDocuments({ createdBy: req.user._id });

  const allUrls = await URL.find({ createdBy: req.user._id })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const totalPages = Math.ceil(totalUrls / limit);
  return res.render("home", {
    urls: allUrls,
    id: req.query.created || null, // last created shortId
    errors: {},
    oldInput: {},
    baseUrl,
    currentPage: page,
    totalPages,
  });
});

router.get("/create-link", async (req, res) => {
  return res.render("create-link", {
    message: null,
    errors: null,
    oldInput: {},
  });
});

router.get("/links", restrictTo(["NORMAL", "ADMIN"]), async (req, res) => {
  // if(!req.user) return res.redirect('/login');
  const allUrls = await URL.find({ createdBy: req.user._id });
  return res.render("links", {
    urls: allUrls,
    errors: {},
    oldInput: {},
  });
});

router.get("/upload", async (req, res) => {
  return res.render("upload");
});

export default router;
