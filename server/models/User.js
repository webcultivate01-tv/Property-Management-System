// ----------------------------------------------------------------------------
// User model
// ----------------------------------------------------------------------------
// Stores every account that can log in OR receive notifications.
// Roles:
//   super_admin  - top-level admin (can manage other admins)
//   admin        - manages properties, inquiries, users
//   agent        - sales agent assigned to properties
//   user         - regular customer / lead (default for visitors)
//
// Passwords are hashed with bcrypt before they hit the database.
// ----------------------------------------------------------------------------

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    // Basic profile
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: {
      type: String,
      required: true,
      unique: true,     // No two users can share an email
      lowercase: true,  // Normalised to lowercase for consistent lookups
      trim: true,
      index: true,      // Speeds up email-based lookups (login, etc.)
    },
    phone: { type: String, trim: true },

    // "select: false" -> never returned by default in queries.
    // Add .select('+password') in code when you actually need it.
    password: { type: String, required: true, minlength: 6, select: false },

    role: {
      type: String,
      enum: ['super_admin', 'admin', 'agent', 'user'],
      default: 'user',
    },

    // Opt-in flag for property-listing email blasts.
    notificationsEnabled: { type: Boolean, default: true },

    avatar: { type: String, default: '' },
    isActive: { type: Boolean, default: true }, // can be deactivated by an admin
    lastLogin: { type: Date },

    // Hidden fields used internally for sessions & password reset.
    refreshToken: { type: String, select: false },
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpire: { type: Date, select: false },
  },
  { timestamps: true } // adds createdAt / updatedAt automatically
);

// --- Password hashing -------------------------------------------------------
// Runs BEFORE every .save(). Skips hashing if the password hasn't changed,
// so updating other fields doesn't re-hash the existing hash.
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(12); // 12 rounds = strong & still fast
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// --- Helper to check a plaintext password against the stored hash ----------
userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// --- Strip sensitive fields whenever a user is sent to the client ---------
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshToken;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpire;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
