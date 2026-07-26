const Book = require('../models/Book');
const { asyncHandler } = require('../middleware/errorHandler');

// @route GET /api/books
// Supports: search, category, language, condition, publisher, minPrice, maxPrice, sort, page, limit
exports.getBooks = asyncHandler(async (req, res) => {
  const {
    search,
    category,
    language,
    condition,
    publisher,
    minPrice,
    maxPrice,
    sort,
    page = 1,
    limit = 12,
    seller,
    status,
  } = req.query;

  const query = {};

  // Buyers only ever see approved books; sellers/admins can pass status=all or a specific status
  if (status === 'all') {
    // no status filter
  } else {
    query.status = status || 'approved';
  }

  if (search) {
    query.$text = { $search: search };
  }
  if (category) query.category = category;
  if (language) query.language = language;
  if (condition) query.condition = condition;
  if (publisher) query.publisher = new RegExp(publisher, 'i');
  if (seller) query.seller = seller;
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  let sortOption = { createdAt: -1 };
  if (sort === 'price_asc') sortOption = { price: 1 };
  if (sort === 'price_desc') sortOption = { price: -1 };
  if (sort === 'rating') sortOption = { ratingAverage: -1 };
  if (sort === 'popular') sortOption = { soldCount: -1 };

  const skip = (Number(page) - 1) * Number(limit);

  const [books, total] = await Promise.all([
    Book.find(query).populate('category', 'name slug').populate('seller', 'name storeName sellerVerified').sort(sortOption).skip(skip).limit(Number(limit)),
    Book.countDocuments(query),
  ]);

  res.json({
    success: true,
    count: books.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / limit),
    books,
  });
});

// @route GET /api/books/:id
exports.getBookById = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id)
    .populate('category', 'name slug')
    .populate('seller', 'name storeName sellerVerified createdAt');

  if (!book) return res.status(404).json({ success: false, message: 'Book not found' });

  book.viewCount += 1;
  await book.save();

  res.json({ success: true, book });
});

// @route POST /api/books  (seller only)
exports.createBook = asyncHandler(async (req, res) => {
  const images = (req.files || []).map((f) => `/uploads/${f.filename}`);

  const book = await Book.create({
    ...req.body,
    images,
    seller: req.user._id,
    status: 'pending',
  });

  res.status(201).json({ success: true, book });
});

// @route PUT /api/books/:id  (seller who owns it, or admin)
exports.updateBook = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) return res.status(404).json({ success: false, message: 'Book not found' });

  const isOwner = book.seller.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';
  if (!isOwner && !isAdmin) {
    return res.status(403).json({ success: false, message: 'Not authorized to edit this book' });
  }

  const updatableFields = [
    'title', 'author', 'publisher', 'isbn', 'category', 'language',
    'condition', 'description', 'price', 'discount', 'stock', 'isFeatured',
  ];
  updatableFields.forEach((field) => {
    if (req.body[field] !== undefined) book[field] = req.body[field];
  });

  if (req.files && req.files.length > 0) {
    book.images = req.files.map((f) => `/uploads/${f.filename}`);
  }

  // Edits by a seller (non-admin) send the listing back for re-approval
  if (isOwner && !isAdmin) {
    book.status = 'pending';
  }

  await book.save();
  res.json({ success: true, book });
});

// @route DELETE /api/books/:id
exports.deleteBook = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) return res.status(404).json({ success: false, message: 'Book not found' });

  const isOwner = book.seller.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';
  if (!isOwner && !isAdmin) {
    return res.status(403).json({ success: false, message: 'Not authorized to delete this book' });
  }

  await book.deleteOne();
  res.json({ success: true, message: 'Book deleted successfully' });
});

// @route PUT /api/books/:id/approve  (admin only)
exports.approveBook = asyncHandler(async (req, res) => {
  const book = await Book.findByIdAndUpdate(
    req.params.id,
    { status: 'approved', rejectionReason: undefined },
    { new: true }
  );
  if (!book) return res.status(404).json({ success: false, message: 'Book not found' });
  res.json({ success: true, book });
});

// @route PUT /api/books/:id/reject  (admin only)
exports.rejectBook = asyncHandler(async (req, res) => {
  const book = await Book.findByIdAndUpdate(
    req.params.id,
    { status: 'rejected', rejectionReason: req.body.reason || 'Did not meet listing guidelines' },
    { new: true }
  );
  if (!book) return res.status(404).json({ success: false, message: 'Book not found' });
  res.json({ success: true, book });
});

// @route GET /api/books/featured/list
exports.getFeaturedBooks = asyncHandler(async (req, res) => {
  const books = await Book.find({ status: 'approved', isFeatured: true }).limit(12);
  res.json({ success: true, books });
});

// @route GET /api/books/trending/list
exports.getTrendingBooks = asyncHandler(async (req, res) => {
  const books = await Book.find({ status: 'approved' }).sort({ viewCount: -1 }).limit(12);
  res.json({ success: true, books });
});

// @route GET /api/books/recent/list
exports.getRecentBooks = asyncHandler(async (req, res) => {
  const books = await Book.find({ status: 'approved' }).sort({ createdAt: -1 }).limit(12);
  res.json({ success: true, books });
});
