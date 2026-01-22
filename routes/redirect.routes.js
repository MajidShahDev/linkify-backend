import express from "express";
import { handleRedirectToOrignalURL } from "../controllers/url.controller.js";

const router = express.Router();

router.route("/:shortId").get(handleRedirectToOrignalURL);

export default router;
