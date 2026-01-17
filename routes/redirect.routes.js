const express = require("express");
const { handleRedirectToOrignalURL } = require("../controllers/url.controller");

const router = express.Router();

router.route("/:shortId").get(handleRedirectToOrignalURL);

module.exports = router;
