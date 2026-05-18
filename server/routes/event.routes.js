// ----------------------------------------------------------------------------
// Event routes  (mounted at /api/events)
// ----------------------------------------------------------------------------
// Public:
//   GET /public          - all currently active events (banners/sliders)
//   GET /popup           - single best event for the homepage popup
//
// Admin (super_admin / admin):
//   GET    /             - list events
//   POST   /             - create event (with banner upload)
//   POST   /trigger-today- cron hook: stamp today's auto-trigger events
//   GET    /:id          - get one
//   PATCH  /:id          - update (and replace/remove banner)
//   PATCH  /:id/toggle   - flip isActive on/off
//   DELETE /:id          - delete event (+ remove banner)
// ----------------------------------------------------------------------------

const express = require('express');
const router = express.Router();

const ctrl = require('../controllers/event.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');
const validate = require('../middlewares/validate.middleware');
const v = require('../validations/event.validation');

// --- Public ---------------------------------------------------------------
router.get('/public', ctrl.listPublic);
router.get('/popup', ctrl.popupEvent);

// --- Admin ---------------------------------------------------------------
router.use(protect, authorize('super_admin', 'admin'));

router.get('/', ctrl.listEvents);
router.post('/', upload.single('image'), v.createEvent, validate, ctrl.createEvent);
router.post('/trigger-today', ctrl.triggerTodaysEvents);

router.get('/:id', ctrl.getEvent);
router.patch('/:id', upload.single('image'), ctrl.updateEvent);
router.patch('/:id/toggle', ctrl.toggleActive);
router.delete('/:id', ctrl.deleteEvent);

module.exports = router;
