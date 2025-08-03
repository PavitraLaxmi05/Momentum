const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { ErrorResponse } = require('../middleware/error.middleware');

// Set storage engine
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const uploadDir = path.join(__dirname, '../public/uploads');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    // Create unique filename: timestamp-originalname
    cb(
      null,
      `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`
    );
  }
});

// Check file type
const fileFilter = (req, file, cb) => {
  // Allowed extensions
  const filetypes = /jpeg|jpg|png|gif|webp/;
  // Check extension
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime type
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new ErrorResponse('Error: Images only (jpeg, jpg, png, gif, webp)!', 400));
  }
};

// Initialize upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 5000000 }, // 5MB max file size
  fileFilter: fileFilter
});

// Middleware to handle file upload errors
const handleUploadErrors = (req, res, next) => {
  return function(err, req, res, next) {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(new ErrorResponse('File too large. Max size is 5MB', 400));
      }
      return next(new ErrorResponse(`Multer error: ${err.message}`, 400));
    } else if (err) {
      return next(err);
    }
    next();
  };
};

module.exports = {
  upload,
  handleUploadErrors
};