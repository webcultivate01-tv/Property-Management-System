// ----------------------------------------------------------------------------
// Cloudinary configuration
// ----------------------------------------------------------------------------
// Cloudinary stores all uploaded images (properties, events, avatars).
// Credentials come from .env. See: https://cloudinary.com/documentation
// ----------------------------------------------------------------------------

const cloudinary = require('cloudinary').v2;

cloudinary.config({
  // Support both new (CLOUDINARY_CLOUD_NAME) and old (CLOUDINARY_NAME) env names.
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true, // always serve images over HTTPS
});

module.exports = cloudinary;
