import express from "express";
import URL from "../models/url.model.js";
import { restrictTo } from "../middlewares/auth.middleware.js";
import { resetPasswordTokenRequired } from "../middlewares/tokenRequired.middleware.js";
import { getHomePageData } from "../services/url.service.js";

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
    // errors: { general: [] }, // <--- make sure this exists
    errors: {}, // <--- make sure this exists
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

router.get("/", restrictTo(["NORMAL","ADMIN"]), async (req,res)=>{
  const data = await getHomePageData(req.user, req.query);
  res.render("home", {
    ...data,
    id: req.query.created || null,
    errors: {},
    oldInput: {},
  });
});


router.get("/create-link", async (req, res) => {
  return res.render("create-link", {
    message: null,
    errors: null,
    oldInput: {},
  });
});

// router.get("/links", restrictTo(["NORMAL", "ADMIN"]), async (req, res) => {
//   // if(!req.user) return res.redirect('/login');
//   const allUrls = await URL.find({ createdBy: req.user._id });
//   return res.render("links", {
//     urls: allUrls,
//     errors: {},
//     oldInput: {},
//   });
// });

router.get("/upload", async (req, res) => {
  return res.render("upload");
});

export default router;




// router.get("/", restrictTo(["NORMAL", "ADMIN"]), async (req, res) => {
//   const baseUrl = process.env.BASE_URL || "http://localhost:8081";

//   const page = parseInt(req.query.page) || 1;
//   const limit = 15;
//   const skip = (page - 1) * limit;

//   const search = (req.query.search || "").trim();
//   const sort = req.query.sort || "newest";

//   // escape regex
//   function escapeRegex(string) {
//     return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
//   }

//   function unescapeUrl(escapedUrl) {
//     return escapedUrl.replace(/\\([.*+?^${}()|[\]\/\\])/g, "$1");
//   }

//   const escapedSearch = escapeRegex(search);

//   // allow searching by full short URL
//   const shortIdSearch = escapedSearch.replace(
//     new RegExp(`^${escapeRegex(baseUrl)}\/?`, "i"),
//     ""
//   );

//   const filter = {
//     createdBy: req.user._id,
//     $or: [
//       { redirectURL: { $regex: escapedSearch, $options: "i" } },
//       { shortId: { $regex: shortIdSearch, $options: "i" } },
//     ],
//   };

//   // sorting logic (explicit & safe)
//   let sortOption;

//   switch (sort) {
//     case "oldest":
//       sortOption = { createdAt: 1 };
//       break;

//     case "mostClicks":
//       sortOption = { clicks: -1 };
//       break;

//     case "leastClicks":
//       sortOption = { clicks: 1 };
//       break;

//     case "newest":
//     default:
//       sortOption = { createdAt: -1 };
//   }

//   const totalUrls = await URL.countDocuments(filter);

//   const urls = await URL.find(filter)
//     .sort(sortOption)
//     .skip(skip)
//     .limit(limit);

//   const displayUrls = urls.map(url => ({
//     ...url._doc,
//     redirectURL: unescapeUrl(url.redirectURL),
//   }));

//   const totalPages = Math.ceil(totalUrls / limit);

//   res.render("home", {
//     urls: displayUrls,
//     baseUrl,
//     currentPage: page,
//     totalPages,
//     search,
//     sort,
//     id: req.query.created || null,
//     errors: {},
//     oldInput: {},
//   });
// });