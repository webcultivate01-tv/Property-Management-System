// ----------------------------------------------------------------------------
// User request validators (admin-only user management)
// ----------------------------------------------------------------------------

const { body } = require('express-validator');

// All allowed roles. Keep this list in sync with User.js.
const ALL_ROLES = ['super_admin', 'admin', 'agent', 'user'];

// POST /api/users  (admin creates a user / agent / admin)
const createUser = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 80 }),
  body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 chars'),
  body('phone').optional({ checkFalsy: true }).isString(),
  body('role').optional().isIn(ALL_ROLES).withMessage('Invalid role'),
];

// PATCH /api/users/:id  (admin updates a user)
const updateUser = [
  body('name').optional().trim().isLength({ min: 2, max: 80 }),
  body('phone').optional({ checkFalsy: true }).isString(),
  body('role').optional().isIn(ALL_ROLES).withMessage('Invalid role'),
  body('isActive').optional().isBoolean(),
];

module.exports = { createUser, updateUser };
