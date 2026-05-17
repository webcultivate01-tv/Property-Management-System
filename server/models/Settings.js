const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
  {
    siteName: { type: String, default: 'Telvine Realty' },
    tagline: { type: String, default: 'Premium Real Estate. Reimagined.' },
    email: { type: String, default: 'contact@telvine.com' },
    phone: { type: String, default: '+91 98765 43210' },
    address: { type: String, default: 'Mumbai, Maharashtra, India' },
    logo: { type: String, default: '' },
    favicon: { type: String, default: '' },
    socials: {
      facebook: { type: String, default: '' },
      instagram: { type: String, default: '' },
      twitter: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      youtube: { type: String, default: '' },
    },
    seo: {
      metaTitle: String,
      metaDescription: String,
      keywords: [String],
    },
  },
  { timestamps: true }
);

settingsSchema.statics.getSingleton = async function () {
  let doc = await this.findOne();
  if (!doc) doc = await this.create({});
  return doc;
};

module.exports = mongoose.model('Settings', settingsSchema);
