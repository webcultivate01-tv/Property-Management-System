const slugify = require('slugify');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const Service = require('../models/Service');
const Testimonial = require('../models/Testimonial');
const Settings = require('../models/Settings');

// Services
exports.listServices = asyncHandler(async (req, res) => {
  const onlyActive = req.query.active === 'true';
  const filter = onlyActive ? { isActive: true } : {};
  const items = await Service.find(filter).sort({ order: 1, createdAt: -1 });
  res.json(new ApiResponse(200, items, 'OK'));
});

exports.createService = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  data.slug = slugify(data.title, { lower: true, strict: true });
  const svc = await Service.create(data);
  res.status(201).json(new ApiResponse(201, svc, 'Service created'));
});

exports.updateService = asyncHandler(async (req, res) => {
  const svc = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!svc) throw new ApiError(404, 'Service not found');
  res.json(new ApiResponse(200, svc, 'Service updated'));
});

exports.deleteService = asyncHandler(async (req, res) => {
  const svc = await Service.findByIdAndDelete(req.params.id);
  if (!svc) throw new ApiError(404, 'Service not found');
  res.json(new ApiResponse(200, null, 'Service deleted'));
});

// Testimonials
exports.listTestimonials = asyncHandler(async (req, res) => {
  const onlyActive = req.query.active === 'true';
  const items = await Testimonial.find(onlyActive ? { isActive: true } : {}).sort({ createdAt: -1 });
  res.json(new ApiResponse(200, items, 'OK'));
});

exports.createTestimonial = asyncHandler(async (req, res) => {
  const t = await Testimonial.create(req.body);
  res.status(201).json(new ApiResponse(201, t, 'Testimonial created'));
});

exports.updateTestimonial = asyncHandler(async (req, res) => {
  const t = await Testimonial.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!t) throw new ApiError(404, 'Testimonial not found');
  res.json(new ApiResponse(200, t, 'Testimonial updated'));
});

exports.deleteTestimonial = asyncHandler(async (req, res) => {
  const t = await Testimonial.findByIdAndDelete(req.params.id);
  if (!t) throw new ApiError(404, 'Testimonial not found');
  res.json(new ApiResponse(200, null, 'Testimonial deleted'));
});

// Settings
exports.getSettings = asyncHandler(async (req, res) => {
  const settings = await Settings.getSingleton();
  res.json(new ApiResponse(200, settings, 'OK'));
});

exports.updateSettings = asyncHandler(async (req, res) => {
  const settings = await Settings.getSingleton();
  Object.assign(settings, req.body);
  await settings.save();
  res.json(new ApiResponse(200, settings, 'Settings updated'));
});
