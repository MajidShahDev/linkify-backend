import express from "express";
import { body } from "express-validator";
import {
  generalAuthLimiter,
  loginLimiter,
} from "../middlewares/rateLimiter.js";
import { restrictTo } from "../middlewares/auth.middleware.js"; 
import {
  handleUserSignup,
  handleUserLogin,
  handleUserLogout,
  handleUploadProfileImage,
  requestToggle2FA,
} from "../controllers/user.controller.js";
import upload from "../middlewares/upload.middleware.js";
import { csrfProtection } from "../middlewares/csrf.middleware.js";

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
  "/upload-profile-image",
  (req, res, next) => {
    upload.single("profileImage")(req, res, function (err) {
      if (err) {
        return res.redirect(
          `/profile?error=${encodeURIComponent(err.message)}`
        );
      }

      next();
    });
  },
  csrfProtection,
  handleUploadProfileImage
);

router.post(
  "/toggle-2fa",
  restrictTo(["USER", "ADMIN"]),
  requestToggle2FA
);

export default router;
