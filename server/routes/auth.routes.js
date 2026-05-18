// ----------------------------------------------------------------------------
// Auth routes  (mounted at /api/auth)
// ----------------------------------------------------------------------------
//   POST /login                       - log in with email + password
//   POST /refresh                     - rotate the access token
//   POST /logout                      - log out (clears cookies)
//   GET  /me                          - get currently logged-in user
//   POST /forgot-password             - start password reset flow
//   POST /reset-password/:token       - finish password reset flow
//
// There is intentionally NO public /register route. Admins create accounts
// via POST /api/users.
// ----------------------------------------------------------------------------

const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();

const ctrl = require('../controllers/auth.controller');
const validate = require('../middlewares/validate.middleware');
const { protect } = require('../middlewares/auth.middleware');
const v = require('../validations/auth.validation');

// Stricter rate-limit for auth endpoints to slow down brute-force attacks.
// Max 20 requests / 15 minutes per IP.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many auth requests, try again later.',
});

// --- Routes ---------------------------------------------------------------
router.post('/login', authLimiter, v.login, validate, ctrl.login);
router.post('/refresh', ctrl.refresh);
router.post('/logout', protect, ctrl.logout);
router.get('/me', protect, ctrl.me);

router.post(
  '/forgot-password',
  authLimiter,
  v.forgotPassword,
  validate,
  ctrl.forgotPassword
);
router.post(
  '/reset-password/:token',
  authLimiter,
  v.resetPassword,
  validate,
  ctrl.resetPassword
);

module.exports = router;
