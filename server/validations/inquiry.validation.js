// ----------------------------------------------------------------------------
// Inquiry request validators
// ----------------------------------------------------------------------------
// Used by POST /api/inquiries (public contact form).
// ----------------------------------------------------------------------------

const { body } = require('express-validator');

const createInquiry = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 80 }),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('phone').trim().notEmpty().withMessage('Phone is required'),
  body('message').trim().notEmpty().withMessage('Message is required').isLength({ max: 2000 }),

  // Optional fields
  body('inquiryType')
    .optional()
    .isIn(['general', 'buying', 'selling', 'renting', 'investment', 'legal']),
  body('property').optional().isMongoId(), // if linked to a specific listing
];

module.exports = { createInquiry };
