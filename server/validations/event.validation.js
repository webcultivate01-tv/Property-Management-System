const { body } = require('express-validator');

const createEvent = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 160 }),
  body('startDate').isISO8601().withMessage('Valid start date required'),
  body('endDate').optional({ checkFalsy: true }).isISO8601().withMessage('Invalid end date'),
  body('type').optional().isIn(['sale', 'festival', 'launch', 'open-house', 'webinar', 'holiday', 'other']),
  body('discountPercent').optional().isFloat({ min: 0, max: 100 }),
  body('isActive').optional().isBoolean(),
  body('autoTrigger').optional().isBoolean(),
  body('color').optional().isString(),
];

module.exports = { createEvent };
