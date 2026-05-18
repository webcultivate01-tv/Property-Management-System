// ----------------------------------------------------------------------------
// Global error handler
// ----------------------------------------------------------------------------
// Express picks up this middleware whenever a route calls next(err) or an
// asyncHandler-wrapped controller throws. It converts ANY error
// (Mongoose, JWT, custom) into a clean JSON response.
//
// Always returns:
//   { success: false, statusCode, message, errors, stack? }
// ----------------------------------------------------------------------------

const ApiError = require('../utils/ApiError');

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let error = err;

  // 1. Mongoose: invalid ObjectId, bad cast, etc.
  if (err.name === 'CastError') {
    error = new ApiError(400, `Invalid ${err.path}: ${err.value}`);
  }

  // 2. Mongoose: schema validation failed (e.g. required field missing).
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    error = new ApiError(400, 'Validation failed', messages);
  }

  // 3. MongoDB: duplicate key (e.g. email already exists).
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error = new ApiError(409, `Duplicate value for ${field}`);
  }

  // 4. JWT: bad signature.
  if (err.name === 'JsonWebTokenError') {
    error = new ApiError(401, 'Invalid token');
  }

  // 5. JWT: expired token.
  if (err.name === 'TokenExpiredError') {
    error = new ApiError(401, 'Token expired');
  }

  // Fall back to 500 if no statusCode was set anywhere.
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  // Log full error details in development only (never in production logs).
  if (process.env.NODE_ENV !== 'production') {
    console.error('[Error]', err);
  }

  // Send a consistent JSON error shape to the client.
  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errors: error.errors || [],
    // Include the stack trace only in development for easier debugging.
    ...(process.env.NODE_ENV !== 'production' ? { stack: err.stack } : {}),
  });
};

module.exports = errorHandler;
