// ----------------------------------------------------------------------------
// Dashboard controller
// ----------------------------------------------------------------------------
// Powers the admin dashboard home screen — one endpoint that returns every
// counter / chart / "recent activity" list in a single response so the
// frontend only has to make one API call.
// ----------------------------------------------------------------------------

const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const Property = require('../models/Property');
const Inquiry = require('../models/Inquiry');
const Review = require('../models/Review');
const User = require('../models/User');
const Event = require('../models/Event');

// @desc   Get every stat the admin dashboard needs
// @route  GET /api/dashboard/stats
exports.getStats = asyncHandler(async (req, res) => {
  const now = new Date();

  // Fire every count/aggregate at the same time using Promise.all so the
  // total response time is "the slowest one", not "the sum of all of them".
  const [
    // Property counts
    totalProperties,
    featuredProperties,
    availableProperties,
    saleProperties,
    rentProperties,

    // Inquiry counts
    totalInquiries,
    newInquiries,

    // Review counts
    totalReviews,
    pendingReviews,

    // User counts
    totalUsers,
    totalCustomers,
    totalStaff,

    // Event counts
    totalEvents,
    liveEvents,
    upcomingEvents,

    // Distributions for charts
    propertyTypeAgg,
    listingTypeAgg,
    inquiryStatusAgg,

    // Recent activity lists
    recentInquiries,
    recentReviews,
    recentProperties,
    topViewedProperties,
    upcomingEventsList,
  ] = await Promise.all([
    // --- Properties ----------------------------------------------------
    Property.countDocuments(),
    Property.countDocuments({ featured: true }),
    Property.countDocuments({ status: 'available' }),
    Property.countDocuments({ listingType: 'sale' }),
    Property.countDocuments({ listingType: 'rent' }),

    // --- Inquiries -----------------------------------------------------
    Inquiry.countDocuments(),
    Inquiry.countDocuments({ status: 'new' }),

    // --- Reviews -------------------------------------------------------
    Review.countDocuments(),
    Review.countDocuments({ status: 'pending' }),

    // --- Users ---------------------------------------------------------
    User.countDocuments(),
    User.countDocuments({ role: 'user' }),
    User.countDocuments({ role: { $in: ['super_admin', 'admin', 'agent'] } }),

    // --- Events --------------------------------------------------------
    Event.countDocuments(),
    // "live" = currently running events (started, not ended yet, active)
    Event.countDocuments({
      isActive: true,
      startDate: { $lte: now },
      $or: [{ endDate: { $gte: now } }, { endDate: null }],
    }),
    // "upcoming" = active events that haven't started yet
    Event.countDocuments({ isActive: true, startDate: { $gt: now } }),

    // --- Charts: group counts by category ------------------------------
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

    // --- Recent activity (latest 5 of each) ----------------------------
    Inquiry.find().sort({ createdAt: -1 }).limit(5).populate('property', 'title'),
    Review.find().sort({ createdAt: -1 }).limit(5),
    Property.find().sort({ createdAt: -1 }).limit(5),
    Property.find({ views: { $gt: 0 } })
      .sort({ views: -1, createdAt: -1 })
      .limit(5)
      .select('title city state price pricePeriod status propertyType images views featured'),
    Event.find({ isActive: true, startDate: { $gte: now } }).sort({ startDate: 1 }).limit(5),
  ]);

  // --- Monthly inquiries chart (last 6 months) -----------------------------
  // Build a date that is the 1st of the month, 5 months ago.
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const monthlyInquiries = await Inquiry.aggregate([
    { $match: { createdAt: { $gte: sixMonthsAgo } } },
    {
      // Group by (year, month) to produce one count per month bucket.
      $group: {
        _id: { y: { $year: '$createdAt' }, m: { $month: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.y': 1, '_id.m': 1 } },
  ]);

  // Send everything to the frontend in one tidy object.
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
        totalCustomers,
        totalStaff,
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
