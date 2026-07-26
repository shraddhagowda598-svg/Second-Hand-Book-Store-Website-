const Wishlist = require('../models/Wishlist');
const { asyncHandler } = require('../middleware/errorHandler');

const getOrCreate = async (userId) => {
  let wishlist = await Wishlist.findOne({ user: userId });
  if (!wishlist) wishlist = await Wishlist.create({ user: userId, books: [] });
  return wishlist;
};

// @route GET /api/wishlist
exports.getWishlist = asyncHandler(async (req, res) => {
  const wishlist = await getOrCreate(req.user._id);
  await wishlist.populate('books');
  res.json({ success: true, wishlist });
});

// @route POST /api/wishlist/:bookId
exports.addToWishlist = asyncHandler(async (req, res) => {
  const wishlist = await getOrCreate(req.user._id);
  if (!wishlist.books.some((b) => b.toString() === req.params.bookId)) {
    wishlist.books.push(req.params.bookId);
    await wishlist.save();
  }
  await wishlist.populate('books');
  res.json({ success: true, wishlist });
});

// @route DELETE /api/wishlist/:bookId
exports.removeFromWishlist = asyncHandler(async (req, res) => {
  const wishlist = await getOrCreate(req.user._id);
  wishlist.books = wishlist.books.filter((b) => b.toString() !== req.params.bookId);
  await wishlist.save();
  await wishlist.populate('books');
  res.json({ success: true, wishlist });
});
