const express = require('express');
const router = express.Router();

const { protect, authorize } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

router.use(protect, authorize('super_admin', 'admin', 'agent'));

// Generic single-file uploader (used for avatars, etc.)
router.post(
  '/image',
  upload.single('image'),
  asyncHandler(async (req, res) => {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    res.json(new ApiResponse(200, { url: req.file.path, publicId: req.file.filename }, 'Uploaded'));
  })
);

module.exports = router;
