// ----------------------------------------------------------------------------
// Event controller
// ----------------------------------------------------------------------------
// Two halves:
//   PUBLIC  - feed banners / popup on the visitor-facing website
//   ADMIN   - CRUD for the Event Management page
//
// Image uploads (banner) are handled by Multer + Cloudinary on the routes.
// ----------------------------------------------------------------------------

const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const Event = require('../models/Event');
const cloudinary = require('../config/cloudinary');

// =====================================================================
//                           PUBLIC ENDPOINTS
// =====================================================================

// @desc   List every event that's currently active (used by banners/sliders)
// @route  GET /api/events/public
exports.listPublic = asyncHandler(async (req, res) => {
  const now = new Date();

  // An event is "currently active" if:
  //   - endDate hasn't passed, OR
  //   - it has no endDate and has already started, OR
  //   - it's scheduled to start in the future (still relevant for banners)
  const items = await Event.find({
    isActive: true,
    $or: [
      { endDate: { $gte: now } },
      { endDate: null, startDate: { $lte: now } },
      { startDate: { $gte: now } },
    ],
  }).sort({ startDate: 1 });

  res.json(new ApiResponse(200, items, 'OK'));
});

// @desc   Get the single best event to show in the homepage popup
// @route  GET /api/events/popup
// Returns the most recently started LIVE event, or null if none.
exports.popupEvent = asyncHandler(async (req, res) => {
  const now = new Date();

  const event = await Event.findOne({
    isActive: true,
    showAsPopup: true,
    startDate: { $lte: now },
    $or: [{ endDate: { $gte: now } }, { endDate: null }],
  }).sort({ startDate: -1, createdAt: -1 });

  res.json(new ApiResponse(200, event, event ? 'OK' : 'No active popup'));
});

// =====================================================================
//                           ADMIN ENDPOINTS
// =====================================================================

// @desc   Admin: list events with search/filter/pagination
// @route  GET /api/events
exports.listEvents = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit) || 12, 100);
  const skip = (page - 1) * limit;
  const { search, type, status } = req.query;

  // Build filter from query params.
  const filter = {};
  if (type) filter.type = type;
  if (search) {
    filter.$or = [
      { title: new RegExp(search, 'i') },
      { description: new RegExp(search, 'i') },
    ];
  }

  // The "status" param is a CONVENIENCE — it maps to a date/active combo.
  if (status === 'live') {
    const now = new Date();
    filter.isActive = true;
    filter.startDate = { $lte: now };
    filter.$or = [{ endDate: { $gte: now } }, { endDate: null }];
  } else if (status === 'upcoming') {
    filter.startDate = { $gt: new Date() };
    filter.isActive = true;
  } else if (status === 'ended') {
    filter.endDate = { $lt: new Date() };
  } else if (status === 'inactive') {
    filter.isActive = false;
  }

  const [items, total] = await Promise.all([
    Event.find(filter)
      .sort({ startDate: -1 })
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'name email'),
    Event.countDocuments(filter),
  ]);

  res.json(
    new ApiResponse(200, items, 'Events fetched', {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    })
  );
});

// @desc   Admin: get one event
// @route  GET /api/events/:id
exports.getEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id).populate('createdBy', 'name email');
  if (!event) throw new ApiError(404, 'Event not found');
  res.json(new ApiResponse(200, event, 'OK'));
});

// Helper: convert the multer-uploaded file (req.file) into our schema shape,
// and parse any JSON-stringified image field coming from FormData.
function normaliseImage(data, file) {
  if (file) {
    data.image = { url: file.path, publicId: file.filename };
  } else if (typeof data.image === 'string') {
    try { data.image = JSON.parse(data.image); } catch { /* keep as-is */ }
  }
  return data;
}

// Helper: FormData sends booleans as strings — coerce them back.
function coerceBooleans(data, keys) {
  for (const k of keys) {
    if (typeof data[k] === 'string') data[k] = data[k] === 'true';
  }
}

// @desc   Admin: create event (with optional banner image)
// @route  POST /api/events
exports.createEvent = asyncHandler(async (req, res) => {
  const data = normaliseImage({ ...req.body }, req.file);
  data.createdBy = req.user.id;

  coerceBooleans(data, ['isActive', 'showAsPopup', 'autoTrigger']);

  const event = await Event.create(data);
  res.status(201).json(new ApiResponse(201, event, 'Event created'));
});

// @desc   Admin: update event (and optionally replace / remove the banner)
// @route  PATCH /api/events/:id
exports.updateEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) throw new ApiError(404, 'Event not found');

  const data = normaliseImage({ ...req.body }, req.file);
  coerceBooleans(data, ['isActive', 'showAsPopup', 'autoTrigger']);

  // 1. If a new image was uploaded, kill the old one from Cloudinary first.
  if (req.file && event.image?.publicId) {
    try { await cloudinary.uploader.destroy(event.image.publicId); } catch {}
  }

  // 2. Admin can explicitly remove the image with removeImage=true.
  if (String(data.removeImage) === 'true' && event.image?.publicId) {
    try { await cloudinary.uploader.destroy(event.image.publicId); } catch {}
    data.image = { url: '', publicId: '' };
    delete data.removeImage;
  }

  Object.assign(event, data);
  await event.save();
  res.json(new ApiResponse(200, event, 'Event updated'));
});

// @desc   Admin: delete event (and remove its banner from Cloudinary)
// @route  DELETE /api/events/:id
exports.deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) throw new ApiError(404, 'Event not found');

  if (event.image?.publicId) {
    try { await cloudinary.uploader.destroy(event.image.publicId); } catch {}
  }
  await event.deleteOne();
  res.json(new ApiResponse(200, null, 'Event deleted'));
});

// @desc   Admin: flip the isActive flag on/off
// @route  PATCH /api/events/:id/toggle
exports.toggleActive = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) throw new ApiError(404, 'Event not found');

  event.isActive = !event.isActive;
  await event.save();
  res.json(new ApiResponse(200, event, 'Toggled'));
});

// @desc   Cron hook: mark every "auto-trigger" event that starts today as triggered
// @route  POST /api/events/trigger-today
// Intended to be called by a scheduled job once a day.
exports.triggerTodaysEvents = asyncHandler(async (req, res) => {
  // Today's window: [00:00:00, 23:59:59].
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const events = await Event.find({
    isActive: true,
    autoTrigger: true,
    startDate: { $gte: start, $lte: end },
    triggeredAt: null, // skip ones already triggered today
  });

  // Stamp each event as triggered (so we don't trigger again on the next run).
  for (const ev of events) {
    ev.triggeredAt = new Date();
    await ev.save();
  }

  res.json(new ApiResponse(200, { triggered: events.length, events }, 'Triggered'));
});
