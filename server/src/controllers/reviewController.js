const Review = require('../models/Review');
const Book = require('../models/Book');
const { asyncHandler } = require('../middleware/errorHandler');

const recalculateBookRating = async (bookId) => {
  const stats = await Review.aggregate([
    { $match: { book: bookId } },
    { $group: { _id: '$book', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);

  await Book.findByIdAndUpdate(bookId, {
    ratingAverage: stats.length ? Math.round(stats[0].avgRating * 10) / 10 : 0,
    ratingCount: stats.length ? stats[0].count : 0,
  });
};

// @route GET /api/reviews/book/:bookId
exports.getBookReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ book: req.params.bookId })
    .populate('user', 'name avatar')
    .sort('-createdAt');
  res.json({ success: true, reviews });
});

// @route POST /api/reviews/book/:bookId  { rating, comment }
exports.addReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;

  const existing = await Review.findOne({ book: req.params.bookId, user: req.user._id });
  if (existing) {
    return res.status(400).json({ success: false, message: 'You have already reviewed this book' });
  }

  const review = await Review.create({
    book: req.params.bookId,
    user: req.user._id,
    rating,
    comment,
  });

  await recalculateBookRating(req.params.bookId);
  res.status(201).json({ success: true, review });
});

// @route PUT /api/reviews/:id
exports.updateReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
  if (review.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  review.rating = req.body.rating ?? review.rating;
  review.comment = req.body.comment ?? review.comment;
  await review.save();
  await recalculateBookRating(review.book);

  res.json({ success: true, review });
});

// @route DELETE /api/reviews/:id
exports.deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
  if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  const bookId = review.book;
  await review.deleteOne();
  await recalculateBookRating(bookId);

  res.json({ success: true, message: 'Review deleted' });
});
