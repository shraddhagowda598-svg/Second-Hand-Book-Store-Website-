const crypto = require('crypto');
const Razorpay = require('razorpay');
const Payment = require('../models/Payment');
const Order = require('../models/Order');
const { asyncHandler } = require('../middleware/errorHandler');

const getRazorpayInstance = () => {
  if (!process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID === 'your_razorpay_key_id') {
    return null;
  }
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

// @route POST /api/payments/razorpay/create-order  { amount } (amount in rupees)
exports.createRazorpayOrder = asyncHandler(async (req, res) => {
  const instance = getRazorpayInstance();
  if (!instance) {
    return res.status(503).json({
      success: false,
      message: 'Razorpay is not configured. Add RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET to .env',
    });
  }

  const { amount } = req.body;
  const options = {
    amount: Math.round(amount * 100), // paise
    currency: 'INR',
    receipt: `receipt_${Date.now()}`,
  };

  const razorpayOrder = await instance.orders.create(options);
  res.json({ success: true, razorpayOrder, keyId: process.env.RAZORPAY_KEY_ID });
});

// @route POST /api/payments/razorpay/verify
// { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId }
exports.verifyRazorpayPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

  const generatedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (generatedSignature !== razorpay_signature) {
    return res.status(400).json({ success: false, message: 'Payment verification failed' });
  }

  const order = await Order.findById(orderId);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

  order.paymentStatus = 'paid';
  order.razorpayOrderId = razorpay_order_id;
  order.razorpayPaymentId = razorpay_payment_id;
  order.trackingHistory.push({ status: 'confirmed', note: 'Payment received via Razorpay' });
  order.orderStatus = 'confirmed';
  await order.save();

  await Payment.create({
    order: order._id,
    user: req.user._id,
    method: 'Razorpay',
    amount: order.grandTotal,
    status: 'success',
    razorpayOrderId: razorpay_order_id,
    razorpayPaymentId: razorpay_payment_id,
    razorpaySignature: razorpay_signature,
  });

  res.json({ success: true, message: 'Payment verified successfully', order });
});

// @route GET /api/payments/my  (buyer's payment history)
exports.getMyPayments = asyncHandler(async (req, res) => {
  const payments = await Payment.find({ user: req.user._id }).populate('order').sort('-createdAt');
  res.json({ success: true, payments });
});

// @route GET /api/payments  (admin only)
exports.getAllPayments = asyncHandler(async (req, res) => {
  const payments = await Payment.find().populate('order').populate('user', 'name email').sort('-createdAt');
  res.json({ success: true, payments });
});

// @route PUT /api/payments/:id/refund  (admin only)
exports.refundPayment = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id);
  if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });

  payment.status = 'refunded';
  payment.refundStatus = 'completed';
  await payment.save();

  res.json({ success: true, payment });
});
