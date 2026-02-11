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
} from "../controllers/user.controller.js";

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

export default router;
