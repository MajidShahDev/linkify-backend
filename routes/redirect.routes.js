
import express from "express";
import { handleRedirectToOrignalURL } from "../controllers/url.controller.js";
import { redirectLimiter } from "../middlewares/rateLimiter.js";

const router = express.Router();

router.get("/:shortId", redirectLimiter, handleRedirectToOrignalURL);



export default router;