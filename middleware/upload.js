const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Define storage location and filename format
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/profile-photos';
    // Create directory if not exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // e.g. userId_timestamp.ext
    const ext = path.extname(file.originalname);
    cb(null, req.user.userId + '_' + Date.now() + ext);
  }
});

// File filter to accept only images
function fileFilter(req, file, cb) {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5 MB max size
});

module.exports = upload;

