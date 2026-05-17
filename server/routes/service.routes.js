const express = require('express');
const router = express.Router();

const ctrl = require('../controllers/service.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

// Public
router.get('/', ctrl.listServices);
router.get('/testimonials', ctrl.listTestimonials);
router.get('/settings', ctrl.getSettings);

// Admin
router.use(protect, authorize('super_admin', 'admin'));

router.post('/', ctrl.createService);
router.patch('/:id', ctrl.updateService);
router.delete('/:id', ctrl.deleteService);

router.post('/testimonials', ctrl.createTestimonial);
router.patch('/testimonials/:id', ctrl.updateTestimonial);
router.delete('/testimonials/:id', ctrl.deleteTestimonial);

router.patch('/settings', ctrl.updateSettings);

module.exports = router;
