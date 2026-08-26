import express from "express";
import URL from "../models/url.model.js";
import { restrictTo } from "../middlewares/auth.middleware.js";
import { resetPasswordTokenRequired } from "../middlewares/tokenRequired.middleware.js";
import { getHomePageData } from "../services/url.service.js";
import User from "../models/user.model.js";
import {
  csrfProtection,
  attachCsrfToken,
} from "../middlewares/csrf.middleware.js";
import AppError from "../utils/AppError.js";

const router = express.Router();

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
    errors: {},
    oldInput: {},
  });
});

router.get("/reset-password/:token", resetPasswordTokenRequired, (req, res) => {
  const { token } = req.params;

  return res.render("auth/reset-password", {
    token, // needed in form action
    error: null,
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
  const data = await getHomePageData(req.user, req.query);
  return res.render("home", {
    ...data,
    urls: allUrls,
    id: req.query.created || null,
    errors: {},
    oldInput: {},
  });
});

router.get("/", restrictTo(["USER", "ADMIN"]), async (req, res) => {
  const data = await getHomePageData(req.user, req.query);
  res.render("home", {
    ...data,
    id: req.query.created || null,
    errors: [],
    oldInput: {},
  });
});

router.get("/profile", async (req, res) => {
  const freshUser = await User.findById(req.user._id);

  res.render("profile", {
    user: freshUser,
    error: req.query.error || null,
    success: req.query.success || null,
  });
});

router.get("/test/app-error", (req, res) => {
  throw new AppError("This is a test AppError", 400);
});

router.get("/test/mongoose-validation", async (req, res) => {
  const user = new User({
    // intentionally missing required fields
  });

  await user.save();

  res.send("Should not reach here");
});

router.get("/test/duplicate-key", async (req, res) => {
  const user = await User.findOne();

  await User.create({
    name: user.name,
    email: user.email, // existing email
    password: "test123",
  });

  res.send("Should not reach here");
});

router.get("/test/cast-error", async (req, res) => {
  await User.findById("this-is-not-a-valid-object-id");

  res.send("Should not reach here");
});

export default router;
