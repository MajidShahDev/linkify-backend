const express = require("express");
// const {} = require("../controllers/url");
const URL = require("../models/url.model");
const { restrictTo } = require("../middlewares/auth.middleware");

const router = express.Router();

// router.route("/").get(handleRedirectToOrignalURL);

router.get("/signup", async (req, res) => {
  return res.render("signup", {
    errors: {},
    oldInput: {},
  });
});

router.get("/login", async (req, res) => {
  return res.render("login", {
    errors: {},
    message: null,
    oldInput: {},
    error: null,
    info: null,
  });
});
router.get("/forgot-password", async (req, res) => {
  return res.render("forgot-password", {
    message: null,
    error: null,
    oldInput: {},
  });
});
router.get("/reset-password", async (req, res) => {
  return res.render("reset-password", {
    token: null,
    error: null,
    oldInput: {},
  });
});

// Show reset password form
router.get("/reset-password/:token", (req, res) => {
  const { token } = req.params;

  // Render your reset-password page with the token
  return res.render("reset-password", {
    token, // needed in form action
    error: null, // no error initially
  });
});

router.get("/verify-email", async (req, res) => {
  return res.render("verify-email", {
    message: null,
    error: null,
    info: null,
    oldInput: {},
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
  const allUrls = await URL.find({ createdBy: req.user._id });
  return res.render("home", {
    urls: allUrls,
    errors: {},
    oldInput: {},
  });
});

router.get("/upload", async (req, res) => {
  return res.render("upload");
});

module.exports = router;
