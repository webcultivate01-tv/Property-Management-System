// ----------------------------------------------------------------------------
// Inquiry routes  (mounted at /api/inquiries)
// ----------------------------------------------------------------------------
// Public:
//   POST   /             - submit an inquiry from the public contact form
//
// Admin (super_admin / admin / agent):
//   GET    /             - list with search/filter/pagination
//   GET    /export       - download all inquiries as CSV
//   GET    /:id          - get one inquiry
//   PATCH  /:id          - update status / notes
//   DELETE /:id          - delete inquiry
// ----------------------------------------------------------------------------

const express = require('express');
const router = express.Router();

const ctrl = require('../controllers/inquiry.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const v = require('../validations/inquiry.validation');

// --- Public submit --------------------------------------------------------
router.post('/', v.createInquiry, validate, ctrl.submitInquiry);

// --- Admin ---------------------------------------------------------------
router.use(protect, authorize('super_admin', 'admin', 'agent'));

router.get('/', ctrl.listInquiries);
router.get('/export', ctrl.exportInquiries);
router.get('/:id', ctrl.getInquiry);
router.patch('/:id', ctrl.updateInquiry);
router.delete('/:id', ctrl.deleteInquiry);

module.exports = router;
