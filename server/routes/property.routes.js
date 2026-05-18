// ----------------------------------------------------------------------------
// Property routes  (mounted at /api/properties)
// ----------------------------------------------------------------------------
// Public:
//   GET    /                  - list with search/filter/sort/pagination
//   GET    /:id               - get one (id can be ObjectId OR slug)
//   GET    /:id/similar       - get up to 4 similar listings
//
// Admin (super_admin / admin / agent):
//   POST   /                  - create (with image upload)
//   PATCH  /:id               - update (and add/remove images)
//   DELETE /:id               - delete (+ remove Cloudinary images)
//   PATCH  /:id/featured      - toggle the featured flag
// ----------------------------------------------------------------------------

const express = require('express');
const router = express.Router();

const ctrl = require('../controllers/property.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');
const validate = require('../middlewares/validate.middleware');
const v = require('../validations/property.validation');

// --- Public ---------------------------------------------------------------
router.get('/', ctrl.listProperties);
router.get('/:id', ctrl.getProperty);
router.get('/:id/similar', ctrl.getSimilar);

// --- Admin (everything below requires auth + a staff role) ---------------
router.use(protect, authorize('super_admin', 'admin', 'agent'));

// Up to 12 images per upload.
router.post(
  '/',
  upload.array('images', 12),
  v.createProperty,
  validate,
  ctrl.createProperty
);
router.patch('/:id', upload.array('images', 12), ctrl.updateProperty);
router.delete('/:id', ctrl.deleteProperty);
router.patch('/:id/featured', ctrl.toggleFeatured);

module.exports = router;
