// ----------------------------------------------------------------------------
// Review model
// ----------------------------------------------------------------------------
// Customer reviews / testimonials submitted from the public website.
// All new reviews start as "pending" and must be approved by an admin
// before they appear on the public site.
// ----------------------------------------------------------------------------

const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, lowercase: true, trim: true }, // optional

    rating: { type: Number, required: true, min: 1, max: 5 },
    review: { type: String, required: true, maxlength: 2000 },

    profileImage: { type: String, default: '' },

    // Moderation status. Only "approved" reviews are public.
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },

    // Optional link if the review is for a specific property.
    property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Review', reviewSchema);
