const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Allowed file types for course materials
const allowedTypes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'application/zip'
];

// Define storage location and filename format
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/course-materials';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    // Include timestamp to avoid conflicts
    cb(null, Date.now() + '_' + file.originalname);
  }
});

// File filter to allow only specific types
function fileFilter(req, file, cb) {
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type!'), false);
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 } // max 20 MB
});

module.exports = upload;
