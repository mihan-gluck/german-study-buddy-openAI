const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure the folder exists
const uploadDir = path.join(__dirname, "..", "uploads", "profile-photos");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Use user ID + timestamp to avoid conflicts
    cb(null, `${req.user.id}_${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ storage });

module.exports = upload;
