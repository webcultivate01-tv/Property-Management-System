// ----------------------------------------------------------------------------
// Property controller
// ----------------------------------------------------------------------------
// CRUD for property listings, plus a public listing endpoint that supports
// search/filter/sort/pagination, a "similar properties" endpoint, and a
// featured-toggle for the admin panel.
//
// Notes:
//   - Images are uploaded via Multer + Cloudinary (see upload middleware).
//   - When a property is created we fire off a notification email to all
//     opted-in users (fire-and-forget, never blocks the API).
// ----------------------------------------------------------------------------

const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const Property = require('../models/Property');
const cloudinary = require('../config/cloudinary');
const { notifyNewProperty } = require('../services/notification.service');

// Helper: when data comes from FormData, arrays/objects arrive as strings.
// Try to JSON.parse; if it fails, fall back to comma-splitting (arrays only).
function parseMaybeJson(value, fallbackToCsv = false) {
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch {
    if (fallbackToCsv) return value.split(',').map((s) => s.trim());
    return value; // leave as-is; caller will handle
  }
}

// @desc   Public listing with search/filter/sort/pagination
// @route  GET /api/properties
exports.listProperties = asyncHandler(async (req, res) => {
  // --- Pagination ---------------------------------------------------------
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit) || 12, 50); // cap at 50 / page
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

  // --- Build the MongoDB filter dynamically --------------------------------
  const filter = {};

  // Free-text search across multiple fields (case-insensitive regex).
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
  if (city) filter.city = new RegExp(`^${city}$`, 'i'); // exact city match
  if (status) filter.status = status;
  if (featured) filter.featured = featured === 'true';
  if (bedrooms) filter.bedrooms = { $gte: parseInt(bedrooms) }; // "at least N"

  // Price range
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  // --- Sort options -------------------------------------------------------
  let sortBy = { createdAt: -1 }; // default: newest first
  if (sort === 'price_asc') sortBy = { price: 1 };
  if (sort === 'price_desc') sortBy = { price: -1 };
  if (sort === 'oldest') sortBy = { createdAt: 1 };

  // Run the find + count in parallel (faster than sequential).
  const [items, total] = await Promise.all([
    Property.find(filter)
      .sort(sortBy)
      .skip(skip)
      .limit(limit)
      .populate('agent', 'name email avatar phone'),
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

// @desc   Get a single property by Mongo _id OR by slug
// @route  GET /api/properties/:id
exports.getProperty = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // 24-char hex => treat as Mongo ObjectId, otherwise treat as slug.
  const query = id.match(/^[0-9a-fA-F]{24}$/) ? { _id: id } : { slug: id };

  const property = await Property.findOne(query).populate(
    'agent',
    'name email avatar phone'
  );
  if (!property) throw new ApiError(404, 'Property not found');

  // Increment view count in the background (don't make the user wait).
  Property.updateOne({ _id: property._id }, { $inc: { views: 1 } }).catch(() => {});

  res.json(new ApiResponse(200, property, 'OK'));
});

// @desc   Get up to 4 similar properties (same city OR same type)
// @route  GET /api/properties/:id/similar
exports.getSimilar = asyncHandler(async (req, res) => {
  const ref = await Property.findById(req.params.id).lean();
  if (!ref) throw new ApiError(404, 'Property not found');

  const items = await Property.find({
    _id: { $ne: ref._id }, // exclude the property itself
    $or: [{ city: ref.city }, { propertyType: ref.propertyType }],
    status: 'available',
  })
    .limit(4)
    .sort({ featured: -1, createdAt: -1 }); // featured first, then newest

  res.json(new ApiResponse(200, items, 'OK'));
});

// @desc   Admin: create a property (with image upload)
// @route  POST /api/properties
exports.createProperty = asyncHandler(async (req, res) => {
  const data = { ...req.body };

  // FormData sends nested fields as strings — parse them back to JS values.
  if (typeof data.amenities === 'string') data.amenities = parseMaybeJson(data.amenities, true);
  if (typeof data.seo === 'string') data.seo = parseMaybeJson(data.seo);
  if (typeof data.location === 'string') data.location = parseMaybeJson(data.location);

  // Attach freshly-uploaded Cloudinary images.
  if (req.files?.length) {
    data.images = req.files.map((f) => ({ url: f.path, publicId: f.filename }));
  }

  // Default the agent to whoever created the listing.
  data.agent = data.agent || req.user.id;

  const property = await Property.create(data);

  // Email all opted-in users about the new listing.
  // Fire-and-forget — SMTP failures must NOT break property creation.
  if (property.status !== 'draft') {
    try {
      notifyNewProperty(property);
    } catch (e) {
      console.error('[notify]', e);
    }
  }

  res.status(201).json(new ApiResponse(201, property, 'Property created'));
});

// @desc   Admin: update a property (and add/remove images)
// @route  PATCH /api/properties/:id
exports.updateProperty = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);
  if (!property) throw new ApiError(404, 'Property not found');

  const data = { ...req.body };

  // Parse stringified fields (same logic as createProperty).
  if (typeof data.amenities === 'string') data.amenities = parseMaybeJson(data.amenities, true);
  if (typeof data.seo === 'string') data.seo = parseMaybeJson(data.seo);
  if (typeof data.location === 'string') data.location = parseMaybeJson(data.location);
  if (typeof data.removeImages === 'string') {
    try { data.removeImages = JSON.parse(data.removeImages); }
    catch { data.removeImages = []; }
  }

  // Remove any images the admin marked for deletion.
  if (Array.isArray(data.removeImages) && data.removeImages.length) {
    // 1. Drop them from the property's image list.
    property.images = property.images.filter(
      (img) => !data.removeImages.includes(img.publicId)
    );
    // 2. Delete the files from Cloudinary (ignore errors — they may be gone already).
    for (const pid of data.removeImages) {
      try { await cloudinary.uploader.destroy(pid); } catch {}
    }
    delete data.removeImages;
  }

  // Append any newly uploaded images to the existing list.
  if (req.files?.length) {
    const newImages = req.files.map((f) => ({ url: f.path, publicId: f.filename }));
    property.images = [...property.images, ...newImages];
  }

  // Apply remaining text fields and save.
  Object.assign(property, data);
  await property.save();

  res.json(new ApiResponse(200, property, 'Property updated'));
});

// @desc   Admin: delete a property (and its Cloudinary images)
// @route  DELETE /api/properties/:id
exports.deleteProperty = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);
  if (!property) throw new ApiError(404, 'Property not found');

  // Free up Cloudinary storage by deleting each image.
  for (const img of property.images) {
    if (img.publicId) {
      try { await cloudinary.uploader.destroy(img.publicId); } catch {}
    }
  }

  await property.deleteOne();
  res.json(new ApiResponse(200, null, 'Property deleted'));
});

// @desc   Admin: flip the "featured" flag on/off
// @route  PATCH /api/properties/:id/featured
exports.toggleFeatured = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);
  if (!property) throw new ApiError(404, 'Property not found');

  property.featured = !property.featured;
  await property.save();
  res.json(new ApiResponse(200, property, 'Featured toggled'));
});
