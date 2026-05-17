const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const User = require('../models/User');

// @desc  List users with pagination/search/filter
exports.listUsers = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit) || 10, 100);
  const skip = (page - 1) * limit;
  const { search, role, roles, isActive } = req.query;

  const filter = {};
  if (search) {
    filter.$or = [
      { name: new RegExp(search, 'i') },
      { email: new RegExp(search, 'i') },
    ];
  }
  if (roles) {
    const list = String(roles)
      .split(',')
      .map((r) => r.trim())
      .filter(Boolean);
    if (list.length) filter.role = { $in: list };
  } else if (role) {
    filter.role = role;
  }
  if (isActive !== undefined) filter.isActive = isActive === 'true';

  const [items, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);

  res.json(
    new ApiResponse(200, items, 'Users fetched', {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    })
  );
});

exports.getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found');
  res.json(new ApiResponse(200, user, 'OK'));
});

exports.createUser = asyncHandler(async (req, res) => {
  const { name, email, password, phone, role } = req.body;
  const exists = await User.findOne({ email });
  if (exists) throw new ApiError(409, 'Email already in use');
  const user = await User.create({ name, email, password, phone, role });
  res.status(201).json(new ApiResponse(201, user, 'User created'));
});

exports.updateUser = asyncHandler(async (req, res) => {
  const { name, phone, role, isActive, avatar } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found');
  if (name !== undefined) user.name = name;
  if (phone !== undefined) user.phone = phone;
  if (role !== undefined) user.role = role;
  if (isActive !== undefined) user.isActive = isActive;
  if (avatar !== undefined) user.avatar = avatar;
  await user.save();
  res.json(new ApiResponse(200, user, 'User updated'));
});

exports.deleteUser = asyncHandler(async (req, res) => {
  if (req.user.id === req.params.id) throw new ApiError(400, 'Cannot delete yourself');
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) throw new ApiError(404, 'User not found');
  res.json(new ApiResponse(200, null, 'User deleted'));
});

exports.updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, avatar } = req.body;
  const user = await User.findById(req.user.id);
  if (name) user.name = name;
  if (phone !== undefined) user.phone = phone;
  if (avatar !== undefined) user.avatar = avatar;
  await user.save();
  res.json(new ApiResponse(200, user, 'Profile updated'));
});

exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) throw new ApiError(400, 'Both passwords required');
  const user = await User.findById(req.user.id).select('+password');
  const ok = await user.matchPassword(currentPassword);
  if (!ok) throw new ApiError(401, 'Current password is incorrect');
  user.password = newPassword;
  await user.save();
  res.json(new ApiResponse(200, null, 'Password changed'));
});
