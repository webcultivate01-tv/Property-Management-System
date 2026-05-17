const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const Review = require('../models/Review');

// Public: submit review (status: pending)
exports.submitReview = asyncHandler(async (req, res) => {
  const review = await Review.create({ ...req.body, status: 'pending' });
  res.status(201).json(new ApiResponse(201, review, 'Review submitted. Awaiting approval.'));
});

// Public: list approved reviews
exports.listApproved = asyncHandler(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 12, 50);
  const items = await Review.find({ status: 'approved' }).sort({ createdAt: -1 }).limit(limit);
  res.json(new ApiResponse(200, items, 'OK'));
});

// Admin: list with pagination/filter
exports.listReviews = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit) || 10, 100);
  const skip = (page - 1) * limit;
  const { status, search } = req.query;

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

exports.updateReviewStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!['pending', 'approved', 'rejected'].includes(status)) {
    throw new ApiError(400, 'Invalid status');
  }
  const review = await Review.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!review) throw new ApiError(404, 'Review not found');
  res.json(new ApiResponse(200, review, 'Review status updated'));
});

exports.deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findByIdAndDelete(req.params.id);
  if (!review) throw new ApiError(404, 'Review not found');
  res.json(new ApiResponse(200, null, 'Review deleted'));
});
