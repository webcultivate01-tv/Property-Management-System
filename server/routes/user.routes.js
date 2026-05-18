// ----------------------------------------------------------------------------
// User routes  (mounted at /api/users)
// ----------------------------------------------------------------------------
//   /me            - any logged-in user updates their own profile / password
//   /              - admin-only CRUD for users
//
// Replaces the old public /auth/register flow. Only admins can create users.
// ----------------------------------------------------------------------------

const express = require('express');
const router = express.Router();

const ctrl = require('../controllers/user.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const v = require('../validations/user.validation');

// Everything below requires authentication.
router.use(protect);

// --- Self-service profile (any authenticated user) -----------------------
router.patch('/me', ctrl.updateProfile);
router.patch('/me/password', ctrl.changePassword);

// --- Admin-only routes from here onwards ---------------------------------
router.use(authorize('super_admin', 'admin'));

router.get('/', ctrl.listUsers);
router.post('/', v.createUser, validate, ctrl.createUser);

router.get('/export', ctrl.exportUsers);
router.post('/sync-from-inquiries', ctrl.syncFromInquiries);

router.get('/:id', ctrl.getUser);
router.patch('/:id', v.updateUser, validate, ctrl.updateUser);
router.delete('/:id', ctrl.deleteUser);

module.exports = router;
