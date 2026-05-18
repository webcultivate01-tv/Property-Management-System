// ----------------------------------------------------------------------------
// User controller
// ----------------------------------------------------------------------------
// Admin user-management + self-service profile endpoints.
//
// Two route groups:
//   /api/users/me      - any logged-in user (manage own profile/password)
//   /api/users/*       - admin only (list/create/update/delete users)
//
// IMPORTANT: There is no public signup. All accounts are created here.
// ----------------------------------------------------------------------------

const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const User = require('../models/User');
const { syncUsersFromInquiries } = require('../services/userSync.service');

// --- Role hierarchy --------------------------------------------------------
// Higher number = more privileged. Used to prevent privilege escalation.
const ROLE_RANK = { user: 1, agent: 2, admin: 3, super_admin: 4 };

// Returns true if `actor` is allowed to assign `targetRole`.
//   - Only a super_admin may create/promote/demote another super_admin.
//   - Otherwise the actor's rank must be >= the target's rank.
function canAssignRole(actor, targetRole) {
  if (!targetRole) return true;
  if (targetRole === 'super_admin') return actor.role === 'super_admin';
  return ROLE_RANK[actor.role] >= ROLE_RANK[targetRole];
}

// Build a Mongo filter shared by list + export.
function buildUserFilter({ search, role, roles, isActive }) {
  const filter = {};

  if (search) {
    filter.$or = [
      { name: new RegExp(search, 'i') },
      { email: new RegExp(search, 'i') },
      { phone: new RegExp(search, 'i') },
    ];
  }

  // "roles" (plural) is a CSV like "admin,agent" -> {$in: [...]}.
  // Falls back to single "role" if only one is provided.
  if (roles) {
    const list = String(roles).split(',').map((r) => r.trim()).filter(Boolean);
    if (list.length) filter.role = { $in: list };
  } else if (role) {
    filter.role = role;
  }

  if (isActive !== undefined) filter.isActive = isActive === 'true';
  return filter;
}

// @desc   Admin: list users with pagination/search/filter
// @route  GET /api/users
exports.listUsers = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit) || 10, 100);
  const skip = (page - 1) * limit;

  const filter = buildUserFilter(req.query);

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

// @desc   Admin: export users (no pagination). Frontend turns it into CSV/Excel.
// @route  GET /api/users/export
exports.exportUsers = asyncHandler(async (req, res) => {
  const filter = buildUserFilter(req.query);
  const items = await User.find(filter).sort({ createdAt: -1 });
  res.json(new ApiResponse(200, items, 'Users exported'));
});

// @desc   Admin: get one user
// @route  GET /api/users/:id
exports.getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found');
  res.json(new ApiResponse(200, user, 'OK'));
});

// @desc   Admin: create a new user (any role they're allowed to assign)
// @route  POST /api/users
exports.createUser = asyncHandler(async (req, res) => {
  const { name, email, password, phone, role = 'user' } = req.body;

  // Refuse role escalations.
  if (!canAssignRole(req.user, role)) {
    throw new ApiError(403, 'You cannot assign this role');
  }

  // Email is unique.
  const exists = await User.findOne({ email });
  if (exists) throw new ApiError(409, 'Email already in use');

  const user = await User.create({ name, email, password, phone, role });
  res.status(201).json(new ApiResponse(201, user, 'User created'));
});

// @desc   Admin: update a user (with privilege-escalation guards)
// @route  PATCH /api/users/:id
exports.updateUser = asyncHandler(async (req, res) => {
  const { name, phone, role, isActive, avatar, notificationsEnabled } = req.body;

  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found');

  // Guard: can the current admin assign this role?
  if (role && role !== user.role && !canAssignRole(req.user, role)) {
    throw new ApiError(403, 'You cannot assign this role');
  }
  // Guard: only super_admin can modify another super_admin.
  if (user.role === 'super_admin' && req.user.role !== 'super_admin') {
    throw new ApiError(403, 'Only a super admin can modify a super admin');
  }

  // Apply partial updates — only fields that were actually sent.
  if (name !== undefined) user.name = name;
  if (phone !== undefined) user.phone = phone;
  if (role !== undefined) user.role = role;
  if (isActive !== undefined) user.isActive = isActive;
  if (avatar !== undefined) user.avatar = avatar;
  if (notificationsEnabled !== undefined) user.notificationsEnabled = notificationsEnabled;

  await user.save();
  res.json(new ApiResponse(200, user, 'User updated'));
});

// @desc   Admin: delete a user (cannot delete yourself or a higher-rank user)
// @route  DELETE /api/users/:id
exports.deleteUser = asyncHandler(async (req, res) => {
  // Don't let an admin delete their own account by accident.
  if (String(req.user._id) === String(req.params.id)) {
    throw new ApiError(400, 'You cannot delete yourself');
  }

  const target = await User.findById(req.params.id);
  if (!target) throw new ApiError(404, 'User not found');

  // Only super_admins can delete super_admins.
  if (target.role === 'super_admin' && req.user.role !== 'super_admin') {
    throw new ApiError(403, 'Only a super admin can delete a super admin');
  }

  await target.deleteOne();
  res.json(new ApiResponse(200, null, 'User deleted'));
});

// @desc   Self-service: any logged-in user updates their own profile
// @route  PATCH /api/users/me
exports.updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, avatar, notificationsEnabled } = req.body;
  const user = await User.findById(req.user.id);

  if (name) user.name = name;
  if (phone !== undefined) user.phone = phone;
  if (avatar !== undefined) user.avatar = avatar;
  if (notificationsEnabled !== undefined) user.notificationsEnabled = notificationsEnabled;

  await user.save();
  res.json(new ApiResponse(200, user, 'Profile updated'));
});

// @desc   Admin: one-shot back-fill — turn every Inquiry into a User account
// @route  POST /api/users/sync-from-inquiries
exports.syncFromInquiries = asyncHandler(async (req, res) => {
  const result = await syncUsersFromInquiries();
  res.json(new ApiResponse(200, result, 'Users synced from inquiries'));
});

// @desc   Self-service: change own password (must verify current first)
// @route  PATCH /api/users/me/password
exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new ApiError(400, 'Both passwords required');
  }
  if (newPassword.length < 6) {
    throw new ApiError(400, 'New password must be at least 6 characters');
  }

  // Load with the hashed password explicitly.
  const user = await User.findById(req.user.id).select('+password');
  const ok = await user.matchPassword(currentPassword);
  if (!ok) throw new ApiError(401, 'Current password is incorrect');

  user.password = newPassword; // pre-save hook re-hashes it
  await user.save();

  res.json(new ApiResponse(200, null, 'Password changed'));
});
