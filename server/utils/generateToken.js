// ----------------------------------------------------------------------------
// JWT helpers
// ----------------------------------------------------------------------------
// We use TWO tokens for authentication:
//   - accessToken  : short-lived (15m). Sent with every API request.
//   - refreshToken : long-lived (7d). Used to get a new access token.
//
// Two different secrets are used so leaking one doesn't compromise the other.
// ----------------------------------------------------------------------------

const jwt = require('jsonwebtoken');

// Create a short-lived access token (used for normal API calls).
const signAccessToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  });

// Create a long-lived refresh token (used only to renew access tokens).
const signRefreshToken = (payload) =>
  jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  });

// Verify an access token. Throws if invalid or expired.
const verifyAccessToken = (token) =>
  jwt.verify(token, process.env.JWT_SECRET);

// Verify a refresh token. Throws if invalid or expired.
const verifyRefreshToken = (token) =>
  jwt.verify(token, process.env.JWT_REFRESH_SECRET);

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
