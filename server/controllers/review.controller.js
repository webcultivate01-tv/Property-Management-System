// ----------------------------------------------------------------------------
// Review controller
// ----------------------------------------------------------------------------
// Customer reviews submitted from the public site, plus the admin
// moderation queue (approve / reject / delete).
// ----------------------------------------------------------------------------

const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const Review = require('../models/Review');

// @desc   Public: submit a review (always goes into the pending queue)
// @route  POST /api/reviews
exports.submitReview = asyncHandler(async (req, res) => {
  // Force status to "pending" — visitors should never be able to self-approve.
  const review = await Review.create({ ...req.body, status: 'pending' });
  res.status(201).json(new ApiResponse(201, review, 'Review submitted. Awaiting approval.'));
});

// @desc   Public: list reviews that an admin has approved
// @route  GET /api/reviews/approved
exports.listApproved = asyncHandler(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 12, 50);
  const items = await Review.find({ status: 'approved' })
    .sort({ createdAt: -1 })
    .limit(limit);
  res.json(new ApiResponse(200, items, 'OK'));
});

// @desc   Admin: list all reviews (with optional filter + pagination)
// @route  GET /api/reviews
exports.listReviews = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit) || 10, 100);
  const skip = (page - 1) * limit;
  const { status, search } = req.query;

  // Build filter from query params.
  const filter = {};
  if (status) filter.status = status;
  if (search) {
    filter.$or = [
      { name: new RegExp(search, 'i') },
      { review: new RegExp(search, 'i') },
    ];
  }

  const [items, total] = await Promise.all([
    Review.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Review.countDocuments(filter),
  ]);

  res.json(
    new ApiResponse(200, items, 'Reviews fetched', {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    })
  );
});

// @desc   Admin: approve / reject / re-queue a review
// @route  PATCH /api/reviews/:id/status
exports.updateReviewStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  // Only allow one of the three known statuses.
  if (!['pending', 'approved', 'rejected'].includes(status)) {
    throw new ApiError(400, 'Invalid status');
  }

  const review = await Review.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true } // return the updated doc
  );
  if (!review) throw new ApiError(404, 'Review not found');

  res.json(new ApiResponse(200, review, 'Review status updated'));
});

// @desc   Admin: hard-delete a review
// @route  DELETE /api/reviews/:id
exports.deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findByIdAndDelete(req.params.id);
  if (!review) throw new ApiError(404, 'Review not found');
  res.json(new ApiResponse(200, null, 'Review deleted'));
});
