// ----------------------------------------------------------------------------
// Settings model (singleton)
// ----------------------------------------------------------------------------
// Stores ONE document with site-wide settings (name, logo, contact info,
// social links, SEO meta). The admin Settings page edits this single record.
//
// Use Settings.getSingleton() to read it — it creates the default record
// the very first time it's called.
// ----------------------------------------------------------------------------

const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
  {
    // Branding / header
    siteName: { type: String, default: 'Telvine Realty' },
    tagline: { type: String, default: 'Premium Real Estate. Reimagined.' },

    // Contact details shown in the footer
    email: { type: String, default: 'contact@telvine.com' },
    phone: { type: String, default: '+91 98765 43210' },
    address: { type: String, default: 'Mumbai, Maharashtra, India' },

    // Logo / favicon (Cloudinary URLs)
    logo: { type: String, default: '' },
    favicon: { type: String, default: '' },

    // Social media handles
    socials: {
      facebook: { type: String, default: '' },
      instagram: { type: String, default: '' },
      twitter: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      youtube: { type: String, default: '' },
    },

    // Default SEO meta for the homepage
    seo: {
      metaTitle: String,
      metaDescription: String,
      keywords: [String],
    },
  },
  { timestamps: true }
);

// Helper: get the ONE settings document, creating it on first call.
// (Singleton pattern — the site only ever needs one settings record.)
settingsSchema.statics.getSingleton = async function () {
  let doc = await this.findOne();
  if (!doc) doc = await this.create({});
  return doc;
};

module.exports = mongoose.model('Settings', settingsSchema);
