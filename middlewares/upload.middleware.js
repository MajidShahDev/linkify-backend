import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { randomUUID } from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../public/uploads/profile"));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    // const uniqueName =`${req.user._id}-${Date.now()}-${Math.random().toString(36).substring(2)}${extensionName}`;
    const uniqueName = `${req.user._id}-${randomUUID()}${ext}`;
    cb(null, uniqueName);
  },
});

// File filter (only images)
const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/webp"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG, PNG, or WEBP images are allowed"), false);
  }
};

const upload = multer({ storage, fileFilter });

export default upload;