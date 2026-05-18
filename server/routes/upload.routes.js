// ----------------------------------------------------------------------------
// Upload routes  (mounted at /api/upload)
// ----------------------------------------------------------------------------
// Admin-only generic image uploader. Used for things like profile avatars
// where there's no full CRUD endpoint yet.
//
// Property / event images are uploaded as part of their respective CRUD
// endpoints — not here.
// ----------------------------------------------------------------------------

const express = require('express');
const router = express.Router();

const { protect, authorize } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

// Everything here is admin-only.
router.use(protect, authorize('super_admin', 'admin', 'agent'));

// POST /api/upload/image — single-file uploader.
// Returns the Cloudinary URL + publicId so the caller can store it.
router.post(
  '/image',
  upload.single('image'),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    res.json(
      new ApiResponse(200, { url: req.file.path, publicId: req.file.filename }, 'Uploaded')
    );
  })
);

module.exports = router;
