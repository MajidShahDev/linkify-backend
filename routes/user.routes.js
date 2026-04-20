import express from "express";
import { body } from "express-validator";
import {
  generalAuthLimiter,
  loginLimiter,
} from "../middlewares/rateLimiter.js";
import {
  handleUserSignup,
  handleUserLogin,
  handleUserLogout,
  handleUploadProfileImage,
} from "../controllers/user.controller.js";
import upload from "../middlewares/upload.middleware.js";

const router = express.Router();

router.post(
  "/signup",
  generalAuthLimiter,
  [
    body("name").notEmpty().withMessage("Name is required"),

    body("email").isEmail().withMessage("Please enter a valid email"),

    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  handleUserSignup
);

router.post(
  "/login",
  loginLimiter,
  [
    body("email")
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Please enter a valid email"),
    body("password")
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  handleUserLogin
);

router.get("/logout", handleUserLogout);

// router.post(
//   "/upload-profile",
//   upload.single("profileImage"),
//   handleUploadProfileImage
// );

router.post(
  "/upload-profile",
  (req, res, next) => {
    upload.single("profileImage")(req, res, function (err) {
      if (err) {
        return res.redirect(`/profile?error=${encodeURIComponent(err.message)}`);
      }
      next();
    });
  },
  handleUploadProfileImage
);

export default router;
