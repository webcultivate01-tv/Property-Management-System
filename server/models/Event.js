const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 160 },
    description: { type: String, default: '', maxlength: 2000 },
    type: {
      type: String,
      enum: ['sale', 'festival', 'launch', 'open-house', 'webinar', 'holiday', 'other'],
      default: 'sale',
    },
    startDate: { type: Date, required: true, index: true },
    endDate: { type: Date },
    discountPercent: { type: Number, default: 0, min: 0, max: 100 },
    bannerImage: { type: String, default: '' },
    color: { type: String, default: '#f97316' },
    isActive: { type: Boolean, default: true, index: true },
    autoTrigger: { type: Boolean, default: true },
    triggeredAt: { type: Date, default: null },
    notes: { type: String, default: '' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// Computed: status based on dates
eventSchema.virtual('status').get(function () {
  const now = new Date();
  if (!this.isActive) return 'inactive';
  if (this.startDate > now) return 'upcoming';
  if (this.endDate && this.endDate < now) return 'ended';
  return 'live';
});

eventSchema.set('toJSON', { virtuals: true });
eventSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Event', eventSchema);
