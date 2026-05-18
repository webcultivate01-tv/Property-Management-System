// ----------------------------------------------------------------------------
// ApiResponse
// ----------------------------------------------------------------------------
// A standard shape for ALL successful API responses, so the frontend always
// knows what to expect:
//   {
//     statusCode: 200,
//     success: true,
//     message: "OK",
//     data: { ... },
//     meta: { ... }   // optional, used for pagination
//   }
//
// Usage:
//     res.json(new ApiResponse(200, data, 'OK'));
//     res.json(new ApiResponse(200, items, 'Fetched', { page, total }));
// ----------------------------------------------------------------------------

class ApiResponse {
  constructor(statusCode, data, message = 'Success', meta = null) {
    this.statusCode = statusCode;
    this.success = statusCode < 400; // 2xx/3xx are success, 4xx/5xx are not
    this.message = message;
    this.data = data;
    if (meta) this.meta = meta;
  }
}

module.exports = ApiResponse;
