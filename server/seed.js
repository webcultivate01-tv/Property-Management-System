require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const Service = require('./models/Service');
const Testimonial = require('./models/Testimonial');
const Settings = require('./models/Settings');

(async () => {
  try {
    await connectDB();

    const email = 'admin@gmail.com';
    const exists = await User.findOne({ email });
    if (!exists) {
      await User.create({
        name: 'Super Admin',
        email,
        password: 'admin123',
        role: 'super_admin',
      });
      console.log(`Created super admin: ${email} / admin123`);
    } else {
      console.log(`Super admin already exists: ${email}`);
    }

    if (!(await Service.countDocuments())) {
      await Service.insertMany([
        { title: 'Property Buying', description: 'Find your dream home with expert guidance.', icon: 'home', order: 1 },
        { title: 'Property Selling', description: 'Sell properties faster with our premium network.', icon: 'tag', order: 2 },
        { title: 'Property Renting', description: 'Quality rental homes across cities.', icon: 'key', order: 3 },
        { title: 'Investment Consulting', description: 'Strategic real-estate investment advisory.', icon: 'trending-up', order: 4 },
        { title: 'Legal Assistance', description: 'End-to-end legal and paperwork support.', icon: 'scale', order: 5 },
      ]);
      console.log('Seeded services');
    }

    if (!(await Testimonial.countDocuments())) {
      await Testimonial.insertMany([
        { name: 'Riya Sharma', designation: 'Home Buyer', quote: 'Telvine made buying our first home effortless.', rating: 5 },
        { name: 'Arjun Mehta', designation: 'Investor', quote: 'Best ROI advisory I have worked with.', rating: 5 },
        { name: 'Neha Kapoor', designation: 'Tenant', quote: 'Found our perfect rental in under a week.', rating: 4 },
      ]);
      console.log('Seeded testimonials');
    }

    await Settings.getSingleton();
    console.log('Settings ready');

    await mongoose.disconnect();
    console.log('Done.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
