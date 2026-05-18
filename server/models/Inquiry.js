// ----------------------------------------------------------------------------
// Inquiry model
// ----------------------------------------------------------------------------
// A lead/contact form submission from a visitor.
// Can either be a general inquiry OR linked to a specific property.
//
// Admins can change the status as they work through the lead:
//   new -> contacted -> interested -> closed   (or "spam")
// ----------------------------------------------------------------------------

const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema(
  {
    // Visitor's contact info
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },

    message: { type: String, required: true, maxlength: 2000 },

    inquiryType: {
      type: String,
      enum: ['general', 'buying', 'selling', 'renting', 'investment', 'legal'],
      default: 'general',
    },

    // Optional link to a specific Property the visitor is asking about.
    property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', default: null },

    status: {
      type: String,
      enum: ['new', 'contacted', 'interested', 'closed', 'spam'],
      default: 'new',
      index: true,
    },

    notes: { type: String, maxlength: 2000 },                     // internal admin notes
    handledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // admin who replied
  },
  { timestamps: true }
);

// Allow text search on name/email/message from the admin panel search box.
inquirySchema.index({ name: 'text', email: 'text', message: 'text' });

module.exports = mongoose.model('Inquiry', inquirySchema);
