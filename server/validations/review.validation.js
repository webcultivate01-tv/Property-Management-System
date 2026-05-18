// ----------------------------------------------------------------------------
// Review request validators
// ----------------------------------------------------------------------------
// Used by POST /api/reviews (public review form).
// ----------------------------------------------------------------------------

const { body } = require('express-validator');

const createReview = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 80 }),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be 1-5'),
  body('review').trim().notEmpty().withMessage('Review text is required').isLength({ max: 2000 }),

  // Optional fields
  body('email').optional().isEmail().withMessage('Invalid email'),
  body('property').optional().isMongoId(),
];

module.exports = { createReview };
