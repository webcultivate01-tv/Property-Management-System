// ----------------------------------------------------------------------------
// Authentication & Authorization middleware
// ----------------------------------------------------------------------------
//   protect  : checks if the request has a valid JWT and attaches req.user.
//   authorize: checks if req.user has one of the allowed roles.
//
// Usage:
//     router.get('/admin-only', protect, authorize('admin'), handler);
// ----------------------------------------------------------------------------

const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { verifyAccessToken } = require('../utils/generateToken');
const User = require('../models/User');

// --- protect ---------------------------------------------------------------
// Ensures the request comes from a logged-in user.
// Looks for the access token in TWO places:
//   1. Authorization header  ->  "Bearer <token>"
//   2. accessToken cookie    ->  set by /api/auth/login
// Then attaches the full user document to req.user.
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // 1. Read token from "Authorization: Bearer ..." header.
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }
  // 2. Fall back to the httpOnly cookie set on login.
  else if (req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) throw new ApiError(401, 'Not authenticated');

  // Verify the JWT signature/expiry.
  const decoded = verifyAccessToken(token);

  // Make sure the user still exists and isn't deactivated.
  const user = await User.findById(decoded.id);
  if (!user) throw new ApiError(401, 'User no longer exists');
  if (!user.isActive) throw new ApiError(403, 'Account deactivated');

  // Make the user available to the next middleware/controller.
  req.user = user;
  next();
});

// --- authorize -------------------------------------------------------------
// Allows only the listed roles. Must run AFTER `protect`.
// Example: authorize('super_admin', 'admin')
const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(new ApiError(403, 'You do not have permission to perform this action'));
  }
  next();
};

module.exports = { protect, authorize };
