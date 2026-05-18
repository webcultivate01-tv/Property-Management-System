// ----------------------------------------------------------------------------
// Dashboard routes  (mounted at /api/dashboard)
// ----------------------------------------------------------------------------
// Admin (super_admin / admin / agent):
//   GET /stats   - one-shot endpoint with every counter / chart / recent list
// ----------------------------------------------------------------------------

const express = require('express');
const router = express.Router();

const ctrl = require('../controllers/dashboard.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

// Everything here is admin-only.
router.use(protect, authorize('super_admin', 'admin', 'agent'));

router.get('/stats', ctrl.getStats);

module.exports = router;
