// ----------------------------------------------------------------------------
// Auth request validators
// ----------------------------------------------------------------------------
// Rules that run BEFORE the auth controller. They check that incoming
// request bodies have the right shape — e.g. valid email, password length.
// `validate` middleware then rejects the request if any rule fails.
// ----------------------------------------------------------------------------

const { body } = require('express-validator');

// Used by POST /api/auth/register (kept for completeness — public signup is
// disabled in routes; admins create users via POST /api/users).
const register = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 80 }),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').optional().isString(),
];

// POST /api/auth/login
const login = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

// POST /api/auth/forgot-password
const forgotPassword = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
];

// POST /api/auth/reset-password/:token
const resetPassword = [
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

module.exports = { register, login, forgotPassword, resetPassword };
