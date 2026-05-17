const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const Property = require('../models/Property');
const Inquiry = require('../models/Inquiry');
const Review = require('../models/Review');
const User = require('../models/User');
const Event = require('../models/Event');

exports.getStats = asyncHandler(async (req, res) => {
  const now = new Date();

  const [
    totalProperties,
    featuredProperties,
    availableProperties,
    saleProperties,
    rentProperties,
    totalInquiries,
    newInquiries,
    totalReviews,
    pendingReviews,
    totalUsers,
    totalEvents,
    liveEvents,
    upcomingEvents,
    propertyTypeAgg,
    listingTypeAgg,
    inquiryStatusAgg,
    recentInquiries,
    recentReviews,
    recentProperties,
    topViewedProperties,
    upcomingEventsList,
  ] = await Promise.all([
    Property.countDocuments(),
    Property.countDocuments({ featured: true }),
    Property.countDocuments({ status: 'available' }),
    Property.countDocuments({ listingType: 'sale' }),
    Property.countDocuments({ listingType: 'rent' }),
    Inquiry.countDocuments(),
    Inquiry.countDocuments({ status: 'new' }),
    Review.countDocuments(),
    Review.countDocuments({ status: 'pending' }),
    User.countDocuments(),
    Event.countDocuments(),
    Event.countDocuments({
      isActive: true,
      startDate: { $lte: now },
      $or: [{ endDate: { $gte: now } }, { endDate: null }],
    }),
    Event.countDocuments({ isActive: true, startDate: { $gt: now } }),
    Property.aggregate([
      { $group: { _id: '$propertyType', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    Property.aggregate([
      { $group: { _id: '$listingType', count: { $sum: 1 } } },
    ]),
    Inquiry.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Inquiry.find().sort({ createdAt: -1 }).limit(5).populate('property', 'title'),
    Review.find().sort({ createdAt: -1 }).limit(5),
    Property.find().sort({ createdAt: -1 }).limit(5),
    Property.find({ views: { $gt: 0 } })
      .sort({ views: -1, createdAt: -1 })
      .limit(5)
      .select('title city state price pricePeriod status propertyType images views featured'),
    Event.find({ isActive: true, startDate: { $gte: now } }).sort({ startDate: 1 }).limit(5),
  ]);

  // Monthly inquiries (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const monthlyInquiries = await Inquiry.aggregate([
    { $match: { createdAt: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: { y: { $year: '$createdAt' }, m: { $month: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.y': 1, '_id.m': 1 } },
  ]);

  res.json(
    new ApiResponse(200, {
      counts: {
        totalProperties,
        featuredProperties,
        availableProperties,
        saleProperties,
        rentProperties,
        totalInquiries,
        newInquiries,
        totalReviews,
        pendingReviews,
        totalUsers,
        totalEvents,
        liveEvents,
        upcomingEvents,
      },
      propertyTypeDistribution: propertyTypeAgg,
      listingTypeDistribution: listingTypeAgg,
      inquiryStatusDistribution: inquiryStatusAgg,
      monthlyInquiries,
      recent: {
        inquiries: recentInquiries,
        reviews: recentReviews,
        properties: recentProperties,
        events: upcomingEventsList,
      },
      topViewedProperties,
    }, 'OK')
  );
});
