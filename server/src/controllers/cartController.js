const Cart = require('../models/Cart');
const Book = require('../models/Book');
const { asyncHandler } = require('../middleware/errorHandler');

const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) cart = await Cart.create({ user: userId, items: [] });
  return cart;
};

// @route GET /api/cart
exports.getCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  await cart.populate('items.book');
  res.json({ success: true, cart });
});

// @route POST /api/cart  { bookId, quantity }
exports.addToCart = asyncHandler(async (req, res) => {
  const { bookId, quantity = 1 } = req.body;

  const book = await Book.findById(bookId);
  if (!book || book.status !== 'approved') {
    return res.status(404).json({ success: false, message: 'Book not available' });
  }

  const cart = await getOrCreateCart(req.user._id);
  const existingItem = cart.items.find((i) => i.book.toString() === bookId);

  if (existingItem) {
    existingItem.quantity += Number(quantity);
  } else {
    cart.items.push({ book: bookId, quantity: Number(quantity) });
  }

  await cart.save();
  await cart.populate('items.book');
  res.json({ success: true, cart });
});

// @route PUT /api/cart/:bookId  { quantity }
exports.updateCartItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  const cart = await getOrCreateCart(req.user._id);
  const item = cart.items.find((i) => i.book.toString() === req.params.bookId);

  if (!item) return res.status(404).json({ success: false, message: 'Item not in cart' });

  if (Number(quantity) <= 0) {
    cart.items = cart.items.filter((i) => i.book.toString() !== req.params.bookId);
  } else {
    item.quantity = Number(quantity);
  }

  await cart.save();
  await cart.populate('items.book');
  res.json({ success: true, cart });
});

// @route DELETE /api/cart/:bookId
exports.removeFromCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  cart.items = cart.items.filter((i) => i.book.toString() !== req.params.bookId);
  await cart.save();
  await cart.populate('items.book');
  res.json({ success: true, cart });
});

// @route DELETE /api/cart
exports.clearCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  cart.items = [];
  await cart.save();
  res.json({ success: true, cart });
});
