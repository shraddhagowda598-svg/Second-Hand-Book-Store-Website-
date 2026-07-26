const User = require('../models/User');
const Book = require('../models/Book');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const { asyncHandler } = require('../middleware/errorHandler');

// @route GET /api/admin/users?role=buyer|seller
exports.getUsers = asyncHandler(async (req, res) => {
  const { role } = req.query;
  const query = {};
  if (role) query.role = role;
  const users = await User.find(query).sort('-createdAt');
  res.json({ success: true, users });
});

// @route PUT /api/admin/users/:id/toggle-active
exports.toggleUserActive = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  user.isActive = !user.isActive;
  await user.save();
  res.json({ success: true, user });
});

// @route PUT /api/admin/users/:id/verify-seller
exports.verifySeller = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user || user.role !== 'seller') {
    return res.status(404).json({ success: false, message: 'Seller not found' });
  }
  user.sellerVerified = true;
  await user.save();
  res.json({ success: true, user });
});

// @route DELETE /api/admin/users/:id
exports.deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  res.json({ success: true, message: 'User deleted' });
});

// @route GET /api/admin/analytics
exports.getAnalytics = asyncHandler(async (req, res) => {
  const [totalUsers, totalBuyers, totalSellers, totalBooks, pendingBooks, totalOrders, revenueAgg] =
    await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'buyer' }),
      User.countDocuments({ role: 'seller' }),
      Book.countDocuments(),
      Book.countDocuments({ status: 'pending' }),
      Order.countDocuments(),
      Order.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$grandTotal' } } },
      ]),
    ]);

  const monthlyRevenue = await Order.aggregate([
    { $match: { paymentStatus: 'paid' } },
    {
      $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        revenue: { $sum: '$grandTotal' },
        orders: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
    { $limit: 12 },
  ]);

  res.json({
    success: true,
    analytics: {
      totalUsers,
      totalBuyers,
      totalSellers,
      totalBooks,
      pendingBooks,
      totalOrders,
      totalRevenue: revenueAgg.length ? revenueAgg[0].total : 0,
      monthlyRevenue,
    },
  });
});

// @route GET /api/admin/export/orders  (CSV)
exports.exportOrdersCSV = asyncHandler(async (req, res) => {
  const orders = await Order.find().populate('buyer', 'name email').sort('-createdAt');

  const header = 'Order Number,Buyer Name,Buyer Email,Grand Total,Payment Method,Payment Status,Order Status,Date\n';
  const rows = orders
    .map((o) =>
      [
        o.orderNumber,
        o.buyer ? o.buyer.name : 'N/A',
        o.buyer ? o.buyer.email : 'N/A',
        o.grandTotal,
        o.paymentMethod,
        o.paymentStatus,
        o.orderStatus,
        new Date(o.createdAt).toISOString(),
      ].join(',')
    )
    .join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=orders-export.csv');
  res.send(header + rows);
});
