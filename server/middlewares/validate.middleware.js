// ----------------------------------------------------------------------------
// Validation middleware
// ----------------------------------------------------------------------------
// Used after a chain of express-validator rules. If any rule failed, we
// stop the request and return a 400 with the field-level error list.
//
// Usage:
//     router.post('/', [body('name').notEmpty(), ...], validate, controller);
// ----------------------------------------------------------------------------

const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

const validate = (req, res, next) => {
  const errors = validationResult(req);

  // No errors? Continue to the controller.
  if (errors.isEmpty()) return next();

  // Format errors as: [{ field, message }, ...] for the frontend.
  const formatted = errors.array().map((e) => ({
    field: e.path,
    message: e.msg,
  }));

  return next(new ApiError(400, 'Validation failed', formatted));
};

module.exports = validate;
