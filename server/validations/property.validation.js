// ----------------------------------------------------------------------------
// Property request validators
// ----------------------------------------------------------------------------
// Used when creating a property via POST /api/properties.
// Update (PATCH) intentionally accepts partial data, so it has no validator.
// ----------------------------------------------------------------------------

const { body } = require('express-validator');

const createProperty = [
  // Title / description are required
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 160 }),
  body('description').trim().notEmpty().withMessage('Description is required'),

  // Property classification
  body('propertyType')
    .isIn(['apartment', 'house', 'villa', 'plot', 'commercial', 'office', 'pg'])
    .withMessage('Invalid property type'),
  body('listingType')
    .isIn(['sale', 'rent'])
    .withMessage('Invalid listing type'),

  // Pricing
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),

  // Location
  body('address').notEmpty().withMessage('Address is required'),
  body('city').notEmpty().withMessage('City is required'),
  body('state').notEmpty().withMessage('State is required'),

  // Specs (optional)
  body('bedrooms').optional().isInt({ min: 0 }),
  body('bathrooms').optional().isInt({ min: 0 }),
  body('area').optional().isFloat({ min: 0 }),
  body('featured').optional().isBoolean(),
];

module.exports = { createProperty };
