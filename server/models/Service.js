// ----------------------------------------------------------------------------
// Service model
// ----------------------------------------------------------------------------
// "What we offer" cards on the public services page
// (e.g. "Property Valuation", "Legal Advisory", "Home Loans"...).
//
// `order` lets the admin drag them into a specific display order.
// `slug` gives each service a friendly URL.
// ----------------------------------------------------------------------------

const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, index: true },
    description: { type: String, required: true },
    icon: { type: String, default: 'home' },  // lucide-icon name shown on the card
    image: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },      // smaller = shown first
  },
  { timestamps: true }
);

module.exports = mongoose.model('Service', serviceSchema);
