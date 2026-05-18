// ----------------------------------------------------------------------------
// Inquiry controller
// ----------------------------------------------------------------------------
// Handles contact-form submissions and the admin "Inquiries" page.
//
// Side effect on submission:
//   When a visitor submits an inquiry we ALSO create / update a User account
//   for them, so they appear in the admin Users list. Failures here never
//   block the inquiry response — they're only logged.
// ----------------------------------------------------------------------------

const crypto = require('crypto');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const Inquiry = require('../models/Inquiry');
const User = require('../models/User');

// Create-or-update a User from inquiry data.
//   - If a user with that email exists, top up missing phone / better name.
//   - Otherwise, create a fresh "user" account with a random password
//     (the visitor can claim it later via "Forgot password").
// Never throws; returns null on any error.
async function upsertUserFromInquiry({ name, email, phone }) {
  try {
    const lowered = String(email).trim().toLowerCase();
    const existing = await User.findOne({ email: lowered });

    if (existing) {
      let changed = false;

      // Add the phone if we didn't have one yet.
      if (!existing.phone && phone) {
        existing.phone = phone;
        changed = true;
      }
      // Prefer a longer/cleaner name if the new one is more detailed.
      if (name && existing.name && name.length > existing.name.length) {
        existing.name = name;
        changed = true;
      }

      if (changed) await existing.save({ validateBeforeSave: false });
      return existing;
    }

    // No existing user — create one. Random password they never use.
    const randomPassword = crypto.randomBytes(20).toString('hex');
    return await User.create({
      name,
      email: lowered,
      phone,
      password: randomPassword,
      role: 'user',
      notificationsEnabled: true,
    });
  } catch (err) {
    console.error('[inquiry] upsertUserFromInquiry failed:', err.message);
    return null;
  }
}

// @desc   Public: submit a new inquiry from the contact form
// @route  POST /api/inquiries
exports.submitInquiry = asyncHandler(async (req, res) => {
  const inquiry = await Inquiry.create(req.body);

  // Run the user-upsert AFTER we've responded to the visitor, so the
  // response stays snappy even if the upsert hits a slow DB write.
  setImmediate(() => upsertUserFromInquiry(req.body));

  res.status(201).json(new ApiResponse(201, inquiry, 'Inquiry submitted'));
});

// @desc   Admin: list inquiries with search/filter/pagination
// @route  GET /api/inquiries
exports.listInquiries = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit) || 10, 100);
  const skip = (page - 1) * limit;
  const { search, status, inquiryType } = req.query;

  // Build the filter from query parameters.
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

  // Query data + total count in parallel.
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

// @desc   Admin: get one inquiry
// @route  GET /api/inquiries/:id
exports.getInquiry = asyncHandler(async (req, res) => {
  const inquiry = await Inquiry.findById(req.params.id)
    .populate('property handledBy', 'name title');
  if (!inquiry) throw new ApiError(404, 'Inquiry not found');
  res.json(new ApiResponse(200, inquiry, 'OK'));
});

// @desc   Admin: update an inquiry's status / notes
// @route  PATCH /api/inquiries/:id
exports.updateInquiry = asyncHandler(async (req, res) => {
  const { status, notes } = req.body;
  const inquiry = await Inquiry.findById(req.params.id);
  if (!inquiry) throw new ApiError(404, 'Inquiry not found');

  if (status) inquiry.status = status;
  if (notes !== undefined) inquiry.notes = notes;
  inquiry.handledBy = req.user.id; // record which admin is handling it
  await inquiry.save();

  res.json(new ApiResponse(200, inquiry, 'Inquiry updated'));
});

// @desc   Admin: delete an inquiry
// @route  DELETE /api/inquiries/:id
exports.deleteInquiry = asyncHandler(async (req, res) => {
  const inquiry = await Inquiry.findByIdAndDelete(req.params.id);
  if (!inquiry) throw new ApiError(404, 'Inquiry not found');
  res.json(new ApiResponse(200, null, 'Inquiry deleted'));
});

// @desc   Admin: download all inquiries as CSV
// @route  GET /api/inquiries/export
exports.exportInquiries = asyncHandler(async (req, res) => {
  const items = await Inquiry.find().sort({ createdAt: -1 }).lean();

  // CSV header row.
  const headers = ['Name', 'Email', 'Phone', 'Type', 'Status', 'Message', 'Created'];

  // One CSV row per inquiry. Escape newlines / commas in the message,
  // and double-quote every cell to handle values containing commas.
  const rows = items.map((i) =>
    [
      i.name,
      i.email,
      i.phone,
      i.inquiryType,
      i.status,
      (i.message || '').replace(/[\n\r,]/g, ' '),
      i.createdAt.toISOString(),
    ]
      .map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`)
      .join(',')
  );

  const csv = [headers.join(','), ...rows].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="inquiries.csv"');
  res.send(csv);
});
