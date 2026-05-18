// ----------------------------------------------------------------------------
// Auth controller
// ----------------------------------------------------------------------------
// Handles login, logout, token refresh, "who am I" and password reset.
//
// IMPORTANT: There is NO public signup endpoint here. Accounts are only
// created by an admin via POST /api/users (see user.controller.js).
// ----------------------------------------------------------------------------

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

// Default options shared by every auth cookie we set.
// httpOnly  -> JavaScript on the client cannot read it (safer)
// secure    -> only sent over HTTPS in production
// sameSite  -> "lax" allows top-level navigation, blocks most CSRF
const cookieOpts = {
  httpOnly: true,
  secure: process.env.COOKIE_SECURE === 'true',
  sameSite: 'lax',
};

// Helper: create both tokens, save the refresh token on the user record,
// and set them as cookies on the response.
async function sendTokens(res, user) {
  const accessToken = signAccessToken({ id: user._id, role: user.role });
  const refreshToken = signRefreshToken({ id: user._id });

  // Persist the refresh token so we can validate it on /refresh.
  user.refreshToken = refreshToken;
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  res
    .cookie('accessToken', accessToken, {
      ...cookieOpts,
      maxAge: 15 * 60 * 1000,                // 15 minutes
    })
    .cookie('refreshToken', refreshToken, {
      ...cookieOpts,
      maxAge: 7 * 24 * 60 * 60 * 1000,       // 7 days
    });

  return { accessToken, refreshToken };
}

// @desc   Log a user in (admin / agent / regular user)
// @route  POST /api/auth/login
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // 1. Find the user, explicitly include the hashed password.
  const user = await User.findOne({ email }).select('+password');
  if (!user) throw new ApiError(401, 'Invalid credentials');
  if (!user.isActive) throw new ApiError(403, 'Account deactivated');

  // 2. Check the password.
  const passwordOk = await user.matchPassword(password);
  if (!passwordOk) throw new ApiError(401, 'Invalid credentials');

  // 3. Issue tokens (in cookies + body for clients that prefer headers).
  const { accessToken, refreshToken } = await sendTokens(res, user);
  res.json(new ApiResponse(200, { user, accessToken, refreshToken }, 'Logged in successfully'));
});

// @desc   Issue a new access token using a valid refresh token
// @route  POST /api/auth/refresh
exports.refresh = asyncHandler(async (req, res) => {
  // Token can come from a cookie or from the body (mobile clients).
  const token = req.cookies?.refreshToken || req.body.refreshToken;
  if (!token) throw new ApiError(401, 'No refresh token');

  // Verify signature/expiry, then make sure it matches what we stored.
  const decoded = verifyRefreshToken(token);
  const user = await User.findById(decoded.id).select('+refreshToken');
  if (!user || user.refreshToken !== token) {
    throw new ApiError(401, 'Invalid refresh token');
  }

  // Issue a fresh access token (refresh token stays the same).
  const accessToken = signAccessToken({ id: user._id, role: user.role });
  res
    .cookie('accessToken', accessToken, { ...cookieOpts, maxAge: 15 * 60 * 1000 })
    .json(new ApiResponse(200, { accessToken }, 'Token refreshed'));
});

// @desc   Log out — clear cookies and invalidate the refresh token
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

// @desc   Return the currently logged-in user (frontend "me" endpoint)
// @route  GET /api/auth/me
exports.me = asyncHandler(async (req, res) => {
  res.json(new ApiResponse(200, { user: req.user }, 'OK'));
});

// @desc   Start the "forgot password" flow — emails a reset link
// @route  POST /api/auth/forgot-password
exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  // SECURITY: don't reveal whether the email is registered.
  // Always return the same response.
  if (!user) {
    return res.json(new ApiResponse(200, null, 'If the email exists, a reset link has been sent'));
  }

  // Generate a one-time reset token. Store only the SHA-256 hash, so even
  // a stolen DB can't be used to reset accounts.
  const resetToken = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.resetPasswordExpire = Date.now() + 60 * 60 * 1000; // 1 hour from now
  await user.save({ validateBeforeSave: false });

  // Build the reset URL the user will click in their email.
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  // In development we return the URL in the response so devs can test
  // without setting up SMTP. In production we keep it hidden.
  const payload = process.env.NODE_ENV === 'production' ? null : { resetUrl };
  res.json(new ApiResponse(200, payload, 'Password reset link generated'));
});

// @desc   Complete the "forgot password" flow — set a new password
// @route  POST /api/auth/reset-password/:token
exports.resetPassword = asyncHandler(async (req, res) => {
  // Hash the token from the URL and look up a user whose stored hash matches
  // AND whose reset window hasn't expired.
  const hashed = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user = await User.findOne({
    resetPasswordToken: hashed,
    resetPasswordExpire: { $gt: Date.now() },
  }).select('+password');

  if (!user) throw new ApiError(400, 'Invalid or expired reset token');

  // Save the new password (pre-save hook re-hashes it) and clear the reset fields.
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  res.json(new ApiResponse(200, null, 'Password reset successful'));
});
