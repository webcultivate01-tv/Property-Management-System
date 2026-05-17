const express = require('express');
const router = express.Router();

const ctrl = require('../controllers/property.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');
const validate = require('../middlewares/validate.middleware');
const v = require('../validations/property.validation');

// Public
router.get('/', ctrl.listProperties);
router.get('/:id', ctrl.getProperty);
router.get('/:id/similar', ctrl.getSimilar);

// Admin
router.use(protect, authorize('super_admin', 'admin', 'agent'));

router.post('/', upload.array('images', 12), v.createProperty, validate, ctrl.createProperty);
router.patch('/:id', upload.array('images', 12), ctrl.updateProperty);
router.delete('/:id', ctrl.deleteProperty);
router.patch('/:id/featured', ctrl.toggleFeatured);

module.exports = router;
