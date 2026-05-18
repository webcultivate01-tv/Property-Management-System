// ----------------------------------------------------------------------------
// Testimonial model
// ----------------------------------------------------------------------------
// Hand-curated client testimonials shown on the homepage carousel.
// Different from Review — these are added directly by an admin (no public
// submission, no moderation queue).
// ----------------------------------------------------------------------------

const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    designation: { type: String, trim: true }, // e.g. "Buyer", "Investor", "CEO of X"
    quote: { type: String, required: true, maxlength: 1000 },
    avatar: { type: String, default: '' },
    rating: { type: Number, min: 1, max: 5, default: 5 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Testimonial', testimonialSchema);
