const express = require('express');
const router = express.Router();

const ctrl = require('../controllers/user.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

router.use(protect);

router.patch('/me', ctrl.updateProfile);
router.patch('/me/password', ctrl.changePassword);

router.use(authorize('super_admin', 'admin'));

router.get('/', ctrl.listUsers);
router.post('/', authorize('super_admin'), ctrl.createUser);
router.get('/:id', ctrl.getUser);
router.patch('/:id', ctrl.updateUser);
router.delete('/:id', authorize('super_admin'), ctrl.deleteUser);

module.exports = router;
