const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const Property = require('../models/Property');
const cloudinary = require('../config/cloudinary');

// @desc  List with search, filter, sort, pagination
exports.listProperties = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit) || 12, 50);
  const skip = (page - 1) * limit;

  const {
    search,
    propertyType,
    listingType,
    city,
    minPrice,
    maxPrice,
    bedrooms,
    status,
    featured,
    sort,
  } = req.query;

  const filter = {};
  if (search) {
    filter.$or = [
      { title: new RegExp(search, 'i') },
      { description: new RegExp(search, 'i') },
      { city: new RegExp(search, 'i') },
      { address: new RegExp(search, 'i') },
    ];
  }
  if (propertyType) filter.propertyType = propertyType;
  if (listingType) filter.listingType = listingType;
  if (city) filter.city = new RegExp(`^${city}$`, 'i');
  if (status) filter.status = status;
  if (featured) filter.featured = featured === 'true';
  if (bedrooms) filter.bedrooms = { $gte: parseInt(bedrooms) };
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  let sortBy = { createdAt: -1 };
  if (sort === 'price_asc') sortBy = { price: 1 };
  if (sort === 'price_desc') sortBy = { price: -1 };
  if (sort === 'oldest') sortBy = { createdAt: 1 };

  const [items, total] = await Promise.all([
    Property.find(filter).sort(sortBy).skip(skip).limit(limit).populate('agent', 'name email avatar phone'),
    Property.countDocuments(filter),
  ]);

  res.json(
    new ApiResponse(200, items, 'Properties fetched', {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    })
  );
});

exports.getProperty = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const query = id.match(/^[0-9a-fA-F]{24}$/) ? { _id: id } : { slug: id };
  const property = await Property.findOne(query).populate('agent', 'name email avatar phone');
  if (!property) throw new ApiError(404, 'Property not found');

  // increment views (fire and forget)
  Property.updateOne({ _id: property._id }, { $inc: { views: 1 } }).catch(() => {});

  res.json(new ApiResponse(200, property, 'OK'));
});

exports.getSimilar = asyncHandler(async (req, res) => {
  const ref = await Property.findById(req.params.id).lean();
  if (!ref) throw new ApiError(404, 'Property not found');
  const items = await Property.find({
    _id: { $ne: ref._id },
    $or: [{ city: ref.city }, { propertyType: ref.propertyType }],
    status: 'available',
  })
    .limit(4)
    .sort({ featured: -1, createdAt: -1 });
  res.json(new ApiResponse(200, items, 'OK'));
});

exports.createProperty = asyncHandler(async (req, res) => {
  const data = { ...req.body };

  // Parse stringified arrays from FormData
  if (typeof data.amenities === 'string') {
    try { data.amenities = JSON.parse(data.amenities); } catch { data.amenities = data.amenities.split(',').map(s => s.trim()); }
  }
  if (typeof data.seo === 'string') { try { data.seo = JSON.parse(data.seo); } catch {} }
  if (typeof data.location === 'string') { try { data.location = JSON.parse(data.location); } catch {} }

  if (req.files?.length) {
    data.images = req.files.map((f) => ({ url: f.path, publicId: f.filename }));
  }

  data.agent = data.agent || req.user.id;
  const property = await Property.create(data);
  res.status(201).json(new ApiResponse(201, property, 'Property created'));
});

exports.updateProperty = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);
  if (!property) throw new ApiError(404, 'Property not found');

  const data = { ...req.body };
  if (typeof data.amenities === 'string') {
    try { data.amenities = JSON.parse(data.amenities); } catch { data.amenities = data.amenities.split(',').map(s => s.trim()); }
  }
  if (typeof data.seo === 'string') { try { data.seo = JSON.parse(data.seo); } catch {} }
  if (typeof data.location === 'string') { try { data.location = JSON.parse(data.location); } catch {} }
  if (typeof data.removeImages === 'string') {
    try { data.removeImages = JSON.parse(data.removeImages); } catch { data.removeImages = []; }
  }

  // Remove images
  if (Array.isArray(data.removeImages) && data.removeImages.length) {
    property.images = property.images.filter((img) => !data.removeImages.includes(img.publicId));
    for (const pid of data.removeImages) {
      try { await cloudinary.uploader.destroy(pid); } catch {}
    }
    delete data.removeImages;
  }

  // Append new images
  if (req.files?.length) {
    const newImages = req.files.map((f) => ({ url: f.path, publicId: f.filename }));
    property.images = [...property.images, ...newImages];
  }

  Object.assign(property, data);
  await property.save();
  res.json(new ApiResponse(200, property, 'Property updated'));
});

exports.deleteProperty = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);
  if (!property) throw new ApiError(404, 'Property not found');

  for (const img of property.images) {
    if (img.publicId) {
      try { await cloudinary.uploader.destroy(img.publicId); } catch {}
    }
  }
  await property.deleteOne();
  res.json(new ApiResponse(200, null, 'Property deleted'));
});

exports.toggleFeatured = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);
  if (!property) throw new ApiError(404, 'Property not found');
  property.featured = !property.featured;
  await property.save();
  res.json(new ApiResponse(200, property, 'Featured toggled'));
});
