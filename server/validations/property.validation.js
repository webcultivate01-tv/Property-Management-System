const { body } = require('express-validator');

const createProperty = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 160 }),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('propertyType')
    .isIn(['apartment', 'house', 'villa', 'plot', 'commercial', 'office', 'pg'])
    .withMessage('Invalid property type'),
  body('listingType').isIn(['sale', 'rent']).withMessage('Invalid listing type'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('address').notEmpty().withMessage('Address is required'),
  body('city').notEmpty().withMessage('City is required'),
  body('state').notEmpty().withMessage('State is required'),
  body('bedrooms').optional().isInt({ min: 0 }),
  body('bathrooms').optional().isInt({ min: 0 }),
  body('area').optional().isFloat({ min: 0 }),
  body('featured').optional().isBoolean(),
];

module.exports = { createProperty };
