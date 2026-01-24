// config/documentUpload.js
// Multer configuration for student document uploads

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = 'uploads/student-documents';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Create student-specific folder
    const studentId = req.user?.id || 'temp';
    const studentFolder = path.join(uploadDir, studentId.toString());
    
    if (!fs.existsSync(studentFolder)) {
      fs.mkdirSync(studentFolder, { recursive: true });
    }
    
    cb(null, studentFolder);
  },
  filename: function (req, file, cb) {
    // Generate unique filename: documentType_timestamp_originalname
    const documentType = req.body.documentType || 'document';
    const timestamp = Date.now();
    const sanitizedOriginalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${documentType}_${timestamp}_${sanitizedOriginalName}`;
    cb(null, filename);
  }
});

// File filter - only allow specific file types
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, JPG, PNG, DOC, and DOCX files are allowed.'), false);
  }
};

// Multer upload configuration
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max file size
  }
});

module.exports = upload;
