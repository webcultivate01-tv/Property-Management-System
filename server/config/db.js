// ----------------------------------------------------------------------------
// Database connection
// ----------------------------------------------------------------------------
// Connects the app to MongoDB using Mongoose.
// The connection URL (MONGO_URI) comes from the .env file.
// ----------------------------------------------------------------------------

const mongoose = require('mongoose');

// Connect to MongoDB. Called once on server startup.
async function connectDB() {
  try {
    // Build indexes automatically only when NOT in production
    // (in production we build indexes manually so deploys don't slow down).
    const options = {
      autoIndex: process.env.NODE_ENV !== 'production',
    };

    const conn = await mongoose.connect(process.env.MONGO_URI, options);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    // If we cannot connect, stop the whole app — nothing else will work.
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
}

module.exports = connectDB;
