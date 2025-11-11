const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure the folder exists
const uploadDir = path.join(__dirname, "..", "uploads", "profile-photos");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Allowed image MIME types
const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp", "image/gif"];

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${req.user.id}_${Date.now()}${path.extname(file.originalname)}`);
  }
});

// ✅ File filter (only allow images)
function fileFilter(req, file, cb) {
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type! Only image files are allowed."), false);
  }
}

const upload = multer({ storage, fileFilter });

module.exports = upload;
