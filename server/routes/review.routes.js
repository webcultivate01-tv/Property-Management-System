// ----------------------------------------------------------------------------
// Review routes  (mounted at /api/reviews)
// ----------------------------------------------------------------------------
// Public:
//   POST   /              - submit a review (goes to moderation queue)
//   GET    /approved      - list approved reviews (for the website)
//
// Admin (super_admin / admin):
//   GET    /              - list all reviews
//   PATCH  /:id/status    - approve / reject / re-queue
//   DELETE /:id           - hard delete
// ----------------------------------------------------------------------------

const express = require('express');
const router = express.Router();

const ctrl = require('../controllers/review.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const v = require('../validations/review.validation');

// --- Public ---------------------------------------------------------------
router.post('/', v.createReview, validate, ctrl.submitReview);
router.get('/approved', ctrl.listApproved);

// --- Admin ---------------------------------------------------------------
router.use(protect, authorize('super_admin', 'admin'));

router.get('/', ctrl.listReviews);
router.patch('/:id/status', ctrl.updateReviewStatus);
router.delete('/:id', ctrl.deleteReview);

module.exports = router;
