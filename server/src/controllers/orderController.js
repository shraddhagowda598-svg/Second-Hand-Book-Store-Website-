const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Book = require('../models/Book');
const Notification = require('../models/Notification');
const { asyncHandler } = require('../middleware/errorHandler');

const generateOrderNumber = () => `BMU${Date.now()}${Math.floor(Math.random() * 1000)}`;

// @route POST /api/orders   { addressId or shippingAddress, paymentMethod }
// Creates an order from the user's current cart. For Razorpay, use /api/payments/razorpay/* flow
// which creates the order after payment verification instead. This endpoint handles COD directly.
exports.placeOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, paymentMethod } = req.body;

  if (!shippingAddress || !paymentMethod) {
    return res.status(400).json({ success: false, message: 'Shipping address and payment method are required' });
  }

  const cart = await Cart.findOne({ user: req.user._id }).populate('items.book');
  if (!cart || cart.items.length === 0) {
    return res.status(400).json({ success: false, message: 'Your cart is empty' });
  }

  // Validate stock and build order items
  const orderItems = [];
  let itemsTotal = 0;
  let discountTotal = 0;

  for (const cartItem of cart.items) {
    const book = cartItem.book;
    if (!book || book.status !== 'approved') {
      return res.status(400).json({ success: false, message: `"${book ? book.title : 'A book'}" is no longer available` });
    }
    if (book.stock < cartItem.quantity) {
      return res.status(400).json({ success: false, message: `Not enough stock for "${book.title}"` });
    }

    const finalPrice = Math.round(book.price - (book.price * book.discount) / 100);
    itemsTotal += book.price * cartItem.quantity;
    discountTotal += (book.price - finalPrice) * cartItem.quantity;

    orderItems.push({
      book: book._id,
      seller: book.seller,
      title: book.title,
      image: book.images[0] || '',
      price: finalPrice,
      quantity: cartItem.quantity,
    });
  }

  const shippingFee = itemsTotal - discountTotal > 500 ? 0 : 40;
  const grandTotal = itemsTotal - discountTotal + shippingFee;

  const order = await Order.create({
    orderNumber: generateOrderNumber(),
    buyer: req.user._id,
    items: orderItems,
    shippingAddress,
    itemsTotal,
    discountTotal,
    shippingFee,
    grandTotal,
    paymentMethod,
    paymentStatus: paymentMethod === 'COD' ? 'pending' : 'pending',
    orderStatus: 'placed',
    trackingHistory: [{ status: 'placed', note: 'Order placed successfully' }],
  });

  // Decrement stock and bump soldCount
  for (const item of orderItems) {
    await Book.findByIdAndUpdate(item.book, {
      $inc: { stock: -item.quantity, soldCount: item.quantity },
    });
  }

  // Clear cart
  cart.items = [];
  await cart.save();

  await Notification.create({
    user: req.user._id,
    title: 'Order placed',
    message: `Your order ${order.orderNumber} has been placed successfully.`,
    type: 'order',
    link: `/orders/${order._id}`,
  });

  res.status(201).json({ success: true, order });
});

// @route GET /api/orders/my
exports.getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ buyer: req.user._id }).sort('-createdAt');
  res.json({ success: true, orders });
});

// @route GET /api/orders/:id
exports.getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('buyer', 'name email phone');
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

  const isBuyer = order.buyer._id.toString() === req.user._id.toString();
  const isSeller = order.items.some((i) => i.seller.toString() === req.user._id.toString());
  const isAdmin = req.user.role === 'admin';

  if (!isBuyer && !isSeller && !isAdmin) {
    return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
  }

  res.json({ success: true, order });
});

// @route GET /api/orders/seller/my  (seller only - orders containing their books)
exports.getSellerOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ 'items.seller': req.user._id }).sort('-createdAt');
  res.json({ success: true, orders });
});

// @route GET /api/orders  (admin only - all orders)
exports.getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find().populate('buyer', 'name email').sort('-createdAt');
  res.json({ success: true, orders });
});

// @route PUT /api/orders/:id/status  (seller/admin)  { status, note }
exports.updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

  const isSeller = order.items.some((i) => i.seller.toString() === req.user._id.toString());
  if (!isSeller && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  order.orderStatus = status;
  order.trackingHistory.push({ status, note });
  if (status === 'delivered') order.paymentStatus = order.paymentMethod === 'COD' ? 'paid' : order.paymentStatus;
  await order.save();

  await Notification.create({
    user: order.buyer,
    title: 'Order status updated',
    message: `Your order ${order.orderNumber} is now "${status.replace('_', ' ')}".`,
    type: 'order',
    link: `/orders/${order._id}`,
  });

  res.json({ success: true, order });
});

// @route PUT /api/orders/:id/cancel  (buyer)  { reason }
exports.cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  if (order.buyer.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }
  if (['shipped', 'out_for_delivery', 'delivered'].includes(order.orderStatus)) {
    return res.status(400).json({ success: false, message: 'Order can no longer be cancelled' });
  }

  order.orderStatus = 'cancelled';
  order.cancelReason = req.body.reason;
  order.trackingHistory.push({ status: 'cancelled', note: req.body.reason });
  await order.save();

  // Restock
  for (const item of order.items) {
    await Book.findByIdAndUpdate(item.book, { $inc: { stock: item.quantity, soldCount: -item.quantity } });
  }

  if (order.paymentStatus === 'paid') {
    order.paymentStatus = 'refunded';
    await order.save();
  }

  res.json({ success: true, order });
});

// @route PUT /api/orders/:id/return  (buyer)  { reason }
exports.requestReturn = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  if (order.buyer.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }
  if (order.orderStatus !== 'delivered') {
    return res.status(400).json({ success: false, message: 'Only delivered orders can be returned' });
  }

  order.orderStatus = 'returned';
  order.returnReason = req.body.reason;
  order.trackingHistory.push({ status: 'returned', note: req.body.reason });
  await order.save();

  res.json({ success: true, order });
});
