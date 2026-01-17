const express = require("express");
const { body } = require("express-validator");
const {handleUserSignup, handleUserLogin, handleUserLogout} = require('../controllers/user.controller');
const router = express.Router();

router.post(
  "/signup",
  [
    body("name")
      .notEmpty()
      .withMessage("Name is required"),

    body("email")
      .isEmail()
      .withMessage("Please enter a valid email"),

    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  handleUserSignup
);

router.post(
  '/login',
  [
    body("email")
      .notEmpty().withMessage("Email is required")
      .isEmail().withMessage("Please enter a valid email"),
    body("password")
      .notEmpty().withMessage("Password is required")
      .isLength({ min: 3 }).withMessage("Password must be at least 3 characters"),
  ],
  handleUserLogin
);

router.get('/logout', handleUserLogout);

module.exports = router;
