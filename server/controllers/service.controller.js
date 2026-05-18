// ----------------------------------------------------------------------------
// Service controller
// ----------------------------------------------------------------------------
// Three small sets of endpoints, grouped here because they all power the
// "site content" sections of the admin panel:
//
//   1. Services      - "What we offer" cards on the public services page
//   2. Testimonials  - hand-picked client quotes on the homepage
//   3. Settings      - site-wide settings (singleton)
// ----------------------------------------------------------------------------

const slugify = require('slugify');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const Service = require('../models/Service');
const Testimonial = require('../models/Testimonial');
const Settings = require('../models/Settings');

// =====================================================================
//                                SERVICES
// =====================================================================

// @desc   List services. Pass ?active=true to skip disabled ones.
// @route  GET /api/services
exports.listServices = asyncHandler(async (req, res) => {
  const onlyActive = req.query.active === 'true';
  const filter = onlyActive ? { isActive: true } : {};

  // order asc, then newest first for ties.
  const items = await Service.find(filter).sort({ order: 1, createdAt: -1 });
  res.json(new ApiResponse(200, items, 'OK'));
});

// @desc   Admin: create a service. Slug is auto-built from the title.
// @route  POST /api/services
exports.createService = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  data.slug = slugify(data.title, { lower: true, strict: true });

  const svc = await Service.create(data);
  res.status(201).json(new ApiResponse(201, svc, 'Service created'));
});

// @desc   Admin: update a service
// @route  PATCH /api/services/:id
exports.updateService = asyncHandler(async (req, res) => {
  const svc = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!svc) throw new ApiError(404, 'Service not found');
  res.json(new ApiResponse(200, svc, 'Service updated'));
});

// @desc   Admin: delete a service
// @route  DELETE /api/services/:id
exports.deleteService = asyncHandler(async (req, res) => {
  const svc = await Service.findByIdAndDelete(req.params.id);
  if (!svc) throw new ApiError(404, 'Service not found');
  res.json(new ApiResponse(200, null, 'Service deleted'));
});

// =====================================================================
//                              TESTIMONIALS
// =====================================================================

// @desc   List testimonials. Pass ?active=true to skip disabled ones.
// @route  GET /api/services/testimonials
exports.listTestimonials = asyncHandler(async (req, res) => {
  const onlyActive = req.query.active === 'true';
  const items = await Testimonial.find(onlyActive ? { isActive: true } : {})
    .sort({ createdAt: -1 });
  res.json(new ApiResponse(200, items, 'OK'));
});

// @desc   Admin: create a testimonial
// @route  POST /api/services/testimonials
exports.createTestimonial = asyncHandler(async (req, res) => {
  const t = await Testimonial.create(req.body);
  res.status(201).json(new ApiResponse(201, t, 'Testimonial created'));
});

// @desc   Admin: update a testimonial
// @route  PATCH /api/services/testimonials/:id
exports.updateTestimonial = asyncHandler(async (req, res) => {
  const t = await Testimonial.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!t) throw new ApiError(404, 'Testimonial not found');
  res.json(new ApiResponse(200, t, 'Testimonial updated'));
});

// @desc   Admin: delete a testimonial
// @route  DELETE /api/services/testimonials/:id
exports.deleteTestimonial = asyncHandler(async (req, res) => {
  const t = await Testimonial.findByIdAndDelete(req.params.id);
  if (!t) throw new ApiError(404, 'Testimonial not found');
  res.json(new ApiResponse(200, null, 'Testimonial deleted'));
});

// =====================================================================
//                                SETTINGS
// =====================================================================

// @desc   Get the site-wide settings document (creates default if missing)
// @route  GET /api/services/settings
exports.getSettings = asyncHandler(async (req, res) => {
  const settings = await Settings.getSingleton();
  res.json(new ApiResponse(200, settings, 'OK'));
});

// @desc   Admin: update site-wide settings
// @route  PATCH /api/services/settings
exports.updateSettings = asyncHandler(async (req, res) => {
  const settings = await Settings.getSingleton();
  Object.assign(settings, req.body);
  await settings.save();
  res.json(new ApiResponse(200, settings, 'Settings updated'));
});
