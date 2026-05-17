const crypto = require('crypto');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const User = require('../models/User');
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} = require('../utils/generateToken');

const cookieOpts = {
  httpOnly: true,
  secure: process.env.COOKIE_SECURE === 'true',
  sameSite: 'lax',
};

const sendTokens = async (res, user) => {
  const accessToken = signAccessToken({ id: user._id, role: user.role });
  const refreshToken = signRefreshToken({ id: user._id });
  user.refreshToken = refreshToken;
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  res
    .cookie('accessToken', accessToken, { ...cookieOpts, maxAge: 15 * 60 * 1000 })
    .cookie('refreshToken', refreshToken, {
      ...cookieOpts,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

  return { accessToken, refreshToken };
};

// @desc   Register user (admins only - public site doesn't expose this)
// @route  POST /api/auth/register
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, role } = req.body;

  const existing = await User.findOne({ email });
  if (existing) throw new ApiError(409, 'Email already registered');

  const user = await User.create({
    name,
    email,
    password,
    phone,
    role: role || 'admin',
  });

  const { accessToken, refreshToken } = await sendTokens(res, user);
  res
    .status(201)
    .json(new ApiResponse(201, { user, accessToken, refreshToken }, 'Registered successfully'));
});

// @desc   Login
// @route  POST /api/auth/login
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user) throw new ApiError(401, 'Invalid credentials');
  if (!user.isActive) throw new ApiError(403, 'Account deactivated');

  const ok = await user.matchPassword(password);
  if (!ok) throw new ApiError(401, 'Invalid credentials');

  const { accessToken, refreshToken } = await sendTokens(res, user);
  res.json(new ApiResponse(200, { user, accessToken, refreshToken }, 'Logged in successfully'));
});

// @desc   Refresh access token
// @route  POST /api/auth/refresh
exports.refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken || req.body.refreshToken;
  if (!token) throw new ApiError(401, 'No refresh token');

  const decoded = verifyRefreshToken(token);
  const user = await User.findById(decoded.id).select('+refreshToken');
  if (!user || user.refreshToken !== token) throw new ApiError(401, 'Invalid refresh token');

  const accessToken = signAccessToken({ id: user._id, role: user.role });
  res
    .cookie('accessToken', accessToken, { ...cookieOpts, maxAge: 15 * 60 * 1000 })
    .json(new ApiResponse(200, { accessToken }, 'Token refreshed'));
});

// @desc   Logout
// @route  POST /api/auth/logout
exports.logout = asyncHandler(async (req, res) => {
  if (req.user) {
    req.user.refreshToken = undefined;
    await req.user.save({ validateBeforeSave: false });
  }
  res
    .clearCookie('accessToken')
    .clearCookie('refreshToken')
    .json(new ApiResponse(200, null, 'Logged out'));
});

// @desc   Get current user
// @route  GET /api/auth/me
exports.me = asyncHandler(async (req, res) => {
  res.json(new ApiResponse(200, { user: req.user }, 'OK'));
});

// @desc   Forgot password (generates reset token; emailing optional)
// @route  POST /api/auth/forgot-password
exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    // Don't reveal existence
    return res.json(new ApiResponse(200, null, 'If the email exists, a reset link has been sent'));
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.resetPasswordExpire = Date.now() + 60 * 60 * 1000;
  await user.save({ validateBeforeSave: false });

  // In a real app, email this URL. For now we return it in dev.
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
  const payload =
    process.env.NODE_ENV === 'production' ? null : { resetUrl };
  res.json(new ApiResponse(200, payload, 'Password reset link generated'));
});

// @desc   Reset password
// @route  POST /api/auth/reset-password/:token
exports.resetPassword = asyncHandler(async (req, res) => {
  const hashed = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user = await User.findOne({
    resetPasswordToken: hashed,
    resetPasswordExpire: { $gt: Date.now() },
  }).select('+password');
  if (!user) throw new ApiError(400, 'Invalid or expired reset token');

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();
  res.json(new ApiResponse(200, null, 'Password reset successful'));
});
