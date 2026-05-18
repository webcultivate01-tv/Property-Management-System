// ----------------------------------------------------------------------------
// ApiError
// ----------------------------------------------------------------------------
// Custom error class used everywhere in the app.
// Lets us throw an error with an HTTP status code, e.g.
//     throw new ApiError(404, 'Property not found');
// The error middleware then turns it into a clean JSON response.
// ----------------------------------------------------------------------------

class ApiError extends Error {
  constructor(statusCode, message = 'Something went wrong', errors = []) {
    super(message);

    this.statusCode = statusCode; // HTTP status (400, 401, 404, 500...)
    this.errors = errors;         // Optional array of field-level errors
    this.success = false;         // Always false for errors

    // Keep a clean stack trace for easier debugging.
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ApiError;
