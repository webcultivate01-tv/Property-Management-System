const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();

const ctrl = require('../controllers/auth.controller');
const validate = require('../middlewares/validate.middleware');
const { protect } = require('../middlewares/auth.middleware');
const v = require('../validations/auth.validation');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many auth requests, try again later.',
});

router.post('/register', authLimiter, v.register, validate, ctrl.register);
router.post('/login', authLimiter, v.login, validate, ctrl.login);
router.post('/refresh', ctrl.refresh);
router.post('/logout', protect, ctrl.logout);
router.get('/me', protect, ctrl.me);
router.post('/forgot-password', authLimiter, v.forgotPassword, validate, ctrl.forgotPassword);
router.post('/reset-password/:token', authLimiter, v.resetPassword, validate, ctrl.resetPassword);

module.exports = router;
