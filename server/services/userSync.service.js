// Back-fills the Users collection from existing Inquiry records.
// Idempotent — safe to run any number of times.
//
// Use cases:
//   1. One-off CLI run after deploying the inquiry → user feature:
//        npm run sync-users
//   2. Admin panel button: POST /api/users/sync-from-inquiries
//
// Records that already have a matching User (by email, case-insensitive)
// are merely topped up with missing phone/name data — never overwritten
// with worse data.

const crypto = require('crypto');
const User = require('../models/User');
const Inquiry = require('../models/Inquiry');

const groupBestPerEmail = (inquiries) => {
  const map = new Map();
  for (const inq of inquiries) {
    if (!inq.email) continue;
    const key = String(inq.email).trim().toLowerCase();
    const cur = map.get(key);
    if (!cur) {
      map.set(key, { name: inq.name, email: key, phone: inq.phone });
      continue;
    }
    // Prefer the longest non-empty name/phone we've seen for this email.
    if (inq.name && inq.name.length > (cur.name || '').length) cur.name = inq.name;
    if (inq.phone && inq.phone.length > (cur.phone || '').length) cur.phone = inq.phone;
  }
  return [...map.values()];
};

async function syncUsersFromInquiries() {
  const inquiries = await Inquiry.find({}, 'name email phone').lean();
  const candidates = groupBestPerEmail(inquiries);

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const c of candidates) {
    try {
      const existing = await User.findOne({ email: c.email });
      if (existing) {
        let dirty = false;
        if (!existing.phone && c.phone) { existing.phone = c.phone; dirty = true; }
        if (c.name && (!existing.name || c.name.length > existing.name.length)) {
          existing.name = c.name; dirty = true;
        }
        if (dirty) { await existing.save({ validateBeforeSave: false }); updated += 1; }
        else skipped += 1;
        continue;
      }

      await User.create({
        name: c.name || c.email.split('@')[0],
        email: c.email,
        phone: c.phone || '',
        // Random password — they never use it. "Forgot password" lets them claim the account.
        password: crypto.randomBytes(20).toString('hex'),
        role: 'user',
        notificationsEnabled: true,
      });
      created += 1;
    } catch (err) {
      console.error(`[sync] failed for ${c.email}:`, err.message);
    }
  }

  return { totalInquiries: inquiries.length, uniqueEmails: candidates.length, created, updated, skipped };
}

module.exports = { syncUsersFromInquiries };
