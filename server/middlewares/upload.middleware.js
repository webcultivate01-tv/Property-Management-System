// ----------------------------------------------------------------------------
// File upload middleware (Multer + Cloudinary)
// ----------------------------------------------------------------------------
// Uses Multer to receive image files from multipart/form-data requests, then
// uploads them directly to Cloudinary (no local disk storage).
//
// Limits:
//   - Only JPG / JPEG / PNG / WEBP images are accepted
//   - Max 5 MB per file
//   - Cloudinary auto-resizes huge images to fit in 1600x1200
//
// Usage:
//     router.post('/', upload.single('image'), handler);
//     router.post('/', upload.array('images', 12), handler);
// ----------------------------------------------------------------------------

const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');
const ApiError = require('../utils/ApiError');

// Tells Multer to push every uploaded file into our Cloudinary account.
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'real-estate',                              // Cloudinary folder
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1600, height: 1200, crop: 'limit' }],
  },
});

// Extra safety check on the MIME type before Cloudinary gets the file.
const fileFilter = (req, file, cb) => {
  if (/^image\/(jpe?g|png|webp)$/i.test(file.mimetype)) {
    cb(null, true); // accept the file
  } else {
    cb(new ApiError(400, 'Only JPG, PNG, WEBP images are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB per file
});

module.exports = upload;
