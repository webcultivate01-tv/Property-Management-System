// ----------------------------------------------------------------------------
// asyncHandler
// ----------------------------------------------------------------------------
// Helper that wraps an async route handler so we don't have to write
// try/catch in every controller. Any error thrown inside is automatically
// forwarded to the Express error middleware via next(err).
//
// Usage:
//     exports.getProperty = asyncHandler(async (req, res) => { ... });
// ----------------------------------------------------------------------------

const asyncHandler = (fn) => (req, res, next) => {
  // Promise.resolve handles both async functions and regular ones.
  // If it rejects, we hand the error to Express via next().
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
