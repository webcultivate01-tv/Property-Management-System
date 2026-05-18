// ----------------------------------------------------------------------------
// Event model
// ----------------------------------------------------------------------------
// Promotional events that appear on the website:
//   - Sales / discount campaigns
//   - Open houses
//   - Festival offers
//   - Launches / webinars
//
// One event at a time can be shown as a popup on the homepage (showAsPopup).
// The "status" field is computed automatically from the dates + isActive.
// ----------------------------------------------------------------------------

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

    // Date range — startDate is required, endDate is optional (open-ended).
    startDate: { type: Date, required: true, index: true },
    endDate: { type: Date },

    discountPercent: { type: Number, default: 0, min: 0, max: 100 },

    // Cloudinary banner image. Optional — popup falls back to text if missing.
    image: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },

    // LEGACY: older records stored a single URL string here.
    // Kept so old seed data / old records still load without errors.
    bannerImage: { type: String, default: '' },

    color: { type: String, default: '#f97316' }, // theme color for the popup

    isActive: { type: Boolean, default: true, index: true },
    showAsPopup: { type: Boolean, default: true, index: true },
    autoTrigger: { type: Boolean, default: true }, // for scheduled "go live" jobs
    triggeredAt: { type: Date, default: null },

    notes: { type: String, default: '' }, // internal admin notes
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// --- Virtual status --------------------------------------------------------
// Not stored in the DB — derived on the fly each time we read the event.
//   inactive : admin turned it off
//   upcoming : starts in the future
//   ended    : end date has passed
//   live     : happening right now
eventSchema.virtual('status').get(function () {
  const now = new Date();
  if (!this.isActive) return 'inactive';
  if (this.startDate > now) return 'upcoming';
  if (this.endDate && this.endDate < now) return 'ended';
  return 'live';
});

// Make sure the virtual "status" field is included in JSON / object output.
eventSchema.set('toJSON', { virtuals: true });
eventSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Event', eventSchema);
