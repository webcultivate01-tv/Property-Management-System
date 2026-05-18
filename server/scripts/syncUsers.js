// CLI: back-fill the Users collection from existing Inquiry records.
// Run from the server directory:
//   npm run sync-users

require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const { syncUsersFromInquiries } = require('../services/userSync.service');

(async () => {
  try {
    await connectDB();
    console.log('[sync] Scanning inquiries…');
    const r = await syncUsersFromInquiries();
    console.log('[sync] Done:', r);
  } catch (err) {
    console.error('[sync] Failed:', err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
})();
