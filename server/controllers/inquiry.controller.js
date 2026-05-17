const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const Inquiry = require('../models/Inquiry');

// @desc Public: submit inquiry
exports.submitInquiry = asyncHandler(async (req, res) => {
  const inquiry = await Inquiry.create(req.body);
  res.status(201).json(new ApiResponse(201, inquiry, 'Inquiry submitted'));
});

// @desc Admin: list with search/filter/pagination
exports.listInquiries = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit) || 10, 100);
  const skip = (page - 1) * limit;
  const { search, status, inquiryType } = req.query;

  const filter = {};
  if (status) filter.status = status;
  if (inquiryType) filter.inquiryType = inquiryType;
  if (search) {
    filter.$or = [
      { name: new RegExp(search, 'i') },
      { email: new RegExp(search, 'i') },
      { phone: new RegExp(search, 'i') },
      { message: new RegExp(search, 'i') },
    ];
  }

  const [items, total] = await Promise.all([
    Inquiry.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('property', 'title slug city price')
      .populate('handledBy', 'name email'),
    Inquiry.countDocuments(filter),
  ]);

  res.json(
    new ApiResponse(200, items, 'Inquiries fetched', {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    })
  );
});

exports.getInquiry = asyncHandler(async (req, res) => {
  const inquiry = await Inquiry.findById(req.params.id).populate('property handledBy', 'name title');
  if (!inquiry) throw new ApiError(404, 'Inquiry not found');
  res.json(new ApiResponse(200, inquiry, 'OK'));
});

exports.updateInquiry = asyncHandler(async (req, res) => {
  const { status, notes } = req.body;
  const inquiry = await Inquiry.findById(req.params.id);
  if (!inquiry) throw new ApiError(404, 'Inquiry not found');
  if (status) inquiry.status = status;
  if (notes !== undefined) inquiry.notes = notes;
  inquiry.handledBy = req.user.id;
  await inquiry.save();
  res.json(new ApiResponse(200, inquiry, 'Inquiry updated'));
});

exports.deleteInquiry = asyncHandler(async (req, res) => {
  const inquiry = await Inquiry.findByIdAndDelete(req.params.id);
  if (!inquiry) throw new ApiError(404, 'Inquiry not found');
  res.json(new ApiResponse(200, null, 'Inquiry deleted'));
});

// @desc Admin: export inquiries as CSV
exports.exportInquiries = asyncHandler(async (req, res) => {
  const items = await Inquiry.find().sort({ createdAt: -1 }).lean();
  const headers = ['Name', 'Email', 'Phone', 'Type', 'Status', 'Message', 'Created'];
  const rows = items.map((i) =>
    [i.name, i.email, i.phone, i.inquiryType, i.status, (i.message || '').replace(/[\n\r,]/g, ' '), i.createdAt.toISOString()]
      .map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`)
      .join(',')
  );
  const csv = [headers.join(','), ...rows].join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="inquiries.csv"');
  res.send(csv);
});
