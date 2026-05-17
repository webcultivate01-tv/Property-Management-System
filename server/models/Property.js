const mongoose = require('mongoose');
const slugify = require('slugify');

const propertySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 160 },
    slug: { type: String, unique: true, index: true },
    description: { type: String, required: true },
    propertyType: {
      type: String,
      enum: ['apartment', 'house', 'villa', 'plot', 'commercial', 'office', 'pg'],
      required: true,
    },
    listingType: {
      type: String,
      enum: ['sale', 'rent'],
      required: true,
    },
    price: { type: Number, required: true, min: 0 },
    pricePeriod: {
      type: String,
      enum: ['one-time', 'monthly', 'yearly'],
      default: 'one-time',
    },

    address: { type: String, required: true },
    city: { type: String, required: true, index: true },
    state: { type: String, required: true },
    country: { type: String, default: 'India' },
    zipCode: { type: String },
    location: {
      lat: Number,
      lng: Number,
    },

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

    amenities: [{ type: String, trim: true }],
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String },
      },
    ],

    status: {
      type: String,
      enum: ['available', 'sold', 'rented', 'pending', 'draft'],
      default: 'available',
      index: true,
    },
    featured: { type: Boolean, default: false, index: true },

    agent: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    seo: {
      metaTitle: String,
      metaDescription: String,
      keywords: [String],
    },

    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

propertySchema.index({ title: 'text', description: 'text', address: 'text', city: 'text' });

propertySchema.pre('save', function (next) {
  if (this.isModified('title')) {
    this.slug = slugify(this.title, { lower: true, strict: true }) + '-' + Date.now().toString(36);
  }
  next();
});

module.exports = mongoose.model('Property', propertySchema);
