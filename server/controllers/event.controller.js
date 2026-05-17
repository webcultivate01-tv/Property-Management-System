const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const Event = require('../models/Event');

// Public: list active events (live + upcoming)
exports.listPublic = asyncHandler(async (req, res) => {
  const now = new Date();
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

// Admin: list with pagination/filter/search
exports.listEvents = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit) || 12, 100);
  const skip = (page - 1) * limit;
  const { search, type, status } = req.query;

  const filter = {};
  if (type) filter.type = type;
  if (search) {
    filter.$or = [
      { title: new RegExp(search, 'i') },
      { description: new RegExp(search, 'i') },
    ];
  }

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
    Event.find(filter).sort({ startDate: -1 }).skip(skip).limit(limit).populate('createdBy', 'name email'),
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

exports.getEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id).populate('createdBy', 'name email');
  if (!event) throw new ApiError(404, 'Event not found');
  res.json(new ApiResponse(200, event, 'OK'));
});

exports.createEvent = asyncHandler(async (req, res) => {
  const event = await Event.create({ ...req.body, createdBy: req.user.id });
  res.status(201).json(new ApiResponse(201, event, 'Event created'));
});

exports.updateEvent = asyncHandler(async (req, res) => {
  const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!event) throw new ApiError(404, 'Event not found');
  res.json(new ApiResponse(200, event, 'Event updated'));
});

exports.deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findByIdAndDelete(req.params.id);
  if (!event) throw new ApiError(404, 'Event not found');
  res.json(new ApiResponse(200, null, 'Event deleted'));
});

exports.toggleActive = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) throw new ApiError(404, 'Event not found');
  event.isActive = !event.isActive;
  await event.save();
  res.json(new ApiResponse(200, event, 'Toggled'));
});

// Trigger today's events (could be called by a cron)
exports.triggerTodaysEvents = asyncHandler(async (req, res) => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const events = await Event.find({
    isActive: true,
    autoTrigger: true,
    startDate: { $gte: start, $lte: end },
    triggeredAt: null,
  });

  for (const ev of events) {
    ev.triggeredAt = new Date();
    await ev.save();
    // Hook for side effects (e.g., apply discount, send emails)
  }

  res.json(new ApiResponse(200, { triggered: events.length, events }, 'Triggered'));
});
