const express = require("express");
const router = express.Router();
const multer = require("multer");
const { handleUploadFile } = require("../controllers/upload");

// const upload = multer({ dest: "uploads" }); // front-end c user jo b file upload kry ga, upload folder mn jay ge.
//                                             // upload is multer instance to create a middlewhere
//                                             // Using diskStorage multer({dest: 'uploads'}) is not needed.

// The disk storage engine gives you full control on storing files to disk.
const storage = multer.diskStorage({
  // storage configuration object telling Multer how to store files (destination, filename).
  destination: function (req, file, cb) {
    return cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    return cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage: storage }); 
//
router.post("/file", upload.single("profile-image"), handleUploadFile);

module.exports = router;
