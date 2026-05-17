const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    message: { type: String, required: true, maxlength: 2000 },
    inquiryType: {
      type: String,
      enum: ['general', 'buying', 'selling', 'renting', 'investment', 'legal'],
      default: 'general',
    },
    property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', default: null },
    status: {
      type: String,
      enum: ['new', 'contacted', 'interested', 'closed', 'spam'],
      default: 'new',
      index: true,
    },
    notes: { type: String, maxlength: 2000 },
    handledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

inquirySchema.index({ name: 'text', email: 'text', message: 'text' });

module.exports = mongoose.model('Inquiry', inquirySchema);
