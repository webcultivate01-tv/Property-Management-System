const express = require('express');
const router = express.Router();

const ctrl = require('../controllers/event.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const v = require('../validations/event.validation');

// Public
router.get('/public', ctrl.listPublic);

// Admin
router.use(protect, authorize('super_admin', 'admin'));

router.get('/', ctrl.listEvents);
router.post('/', v.createEvent, validate, ctrl.createEvent);
router.post('/trigger-today', ctrl.triggerTodaysEvents);
router.get('/:id', ctrl.getEvent);
router.patch('/:id', ctrl.updateEvent);
router.patch('/:id/toggle', ctrl.toggleActive);
router.delete('/:id', ctrl.deleteEvent);

module.exports = router;
