const express = require('express');
const router = express.Router();

const ctrl = require('../controllers/dashboard.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

router.use(protect, authorize('super_admin', 'admin', 'agent'));

router.get('/stats', ctrl.getStats);

module.exports = router;
