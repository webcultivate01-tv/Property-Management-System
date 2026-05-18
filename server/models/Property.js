// ----------------------------------------------------------------------------
// Property model
// ----------------------------------------------------------------------------
// The main listing in the app. Every house/flat/plot for sale or rent is
// stored as one Property document.
//
// Slug:
//   Auto-generated from the title (e.g. "luxury-villa-mumbai-l8xyz") so we
//   can use friendly URLs like /properties/luxury-villa-mumbai-l8xyz.
//
// Text index:
//   Allows searching across title/description/address/city with $text.
// ----------------------------------------------------------------------------

const mongoose = require('mongoose');
const slugify = require('slugify');

const propertySchema = new mongoose.Schema(
  {
    // --- Basics --------------------------------------------------------
    title: { type: String, required: true, trim: true, maxlength: 160 },
    slug: { type: String, unique: true, index: true }, // auto-built in pre-save
    description: { type: String, required: true },

    propertyType: {
      type: String,
      enum: ['apartment', 'house', 'villa', 'plot', 'commercial', 'office', 'pg'],
      required: true,
    },
    listingType: {
      type: String,
      enum: ['sale', 'rent'], // is this for sale or rent?
      required: true,
    },

    // --- Pricing -------------------------------------------------------
    price: { type: Number, required: true, min: 0 },
    pricePeriod: {
      type: String,
      enum: ['one-time', 'monthly', 'yearly'], // monthly = rent per month, etc.
      default: 'one-time',
    },

    // --- Location ------------------------------------------------------
    address: { type: String, required: true },
    city: { type: String, required: true, index: true },
    state: { type: String, required: true },
    country: { type: String, default: 'India' },
    zipCode: { type: String },
    location: {
      lat: Number, // latitude  (optional, for map markers)
      lng: Number, // longitude
    },

    // --- Specifications -----------------------------------------------
    bedrooms: { type: Number, default: 0 },
    bathrooms: { type: Number, default: 0 },
    area: { type: Number, default: 0 },
    areaUnit: { type: String, enum: ['sqft', 'sqm', 'acre'], default: 'sqft' },
    yearBuilt: { type: Number },
    parking: { type: Number, default: 0 },
    furnishing: {
      type: String,
      enum: ['unfurnished', 'semi-furnished', 'furnished'],
      default: 'unfurnished',
    },

    // List of feature tags ("gym", "swimming-pool", ...)
    amenities: [{ type: String, trim: true }],

    // Cloudinary image references. publicId is needed to delete from Cloudinary.
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String },
      },
    ],

    // --- Status flags --------------------------------------------------
    status: {
      type: String,
      enum: ['available', 'sold', 'rented', 'pending', 'draft'],
      default: 'available',
      index: true,
    },
    featured: { type: Boolean, default: false, index: true },

    // Assigned sales agent (user with role "agent" or "admin")
    agent: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    // --- SEO meta for the public detail page --------------------------
    seo: {
      metaTitle: String,
      metaDescription: String,
      keywords: [String],
    },

    // Counter incremented every time a user views the detail page.
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// --- Full-text search index ------------------------------------------------
// Lets us run Property.find({ $text: { $search: ... } }) across these fields.
propertySchema.index({
  title: 'text',
  description: 'text',
  address: 'text',
  city: 'text',
});

// --- Auto-generate the slug whenever the title changes --------------------
// We append a short base36 timestamp to keep slugs unique even when two
// properties have the exact same title.
propertySchema.pre('save', function (next) {
  if (this.isModified('title')) {
    const base = slugify(this.title, { lower: true, strict: true });
    this.slug = `${base}-${Date.now().toString(36)}`;
  }
  next();
});

module.exports = mongoose.model('Property', propertySchema);
