// ----------------------------------------------------------------------------
// Service / Testimonial / Settings routes  (mounted at /api/services)
// ----------------------------------------------------------------------------
// Public:
//   GET    /                       - list services
//   GET    /testimonials           - list testimonials
//   GET    /settings               - get site-wide settings
//
// Admin (super_admin / admin):
//   POST   /                       - create service
//   PATCH  /:id                    - update service
//   DELETE /:id                    - delete service
//   POST   /testimonials           - create testimonial
//   PATCH  /testimonials/:id       - update testimonial
//   DELETE /testimonials/:id       - delete testimonial
//   PATCH  /settings               - update site-wide settings
// ----------------------------------------------------------------------------

const express = require('express');
const router = express.Router();

const ctrl = require('../controllers/service.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

// --- Public ---------------------------------------------------------------
router.get('/', ctrl.listServices);
router.get('/testimonials', ctrl.listTestimonials);
router.get('/settings', ctrl.getSettings);

// --- Admin ---------------------------------------------------------------
router.use(protect, authorize('super_admin', 'admin'));

// Services
router.post('/', ctrl.createService);
router.patch('/:id', ctrl.updateService);
router.delete('/:id', ctrl.deleteService);

// Testimonials
router.post('/testimonials', ctrl.createTestimonial);
router.patch('/testimonials/:id', ctrl.updateTestimonial);
router.delete('/testimonials/:id', ctrl.deleteTestimonial);

// Settings (singleton)
router.patch('/settings', ctrl.updateSettings);

module.exports = router;
