const express = require('express');
const router = express.Router();
const {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  approveBook,
  rejectBook,
  getFeaturedBooks,
  getTrendingBooks,
  getRecentBooks,
} = require('../controllers/bookController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/featured/list', getFeaturedBooks);
router.get('/trending/list', getTrendingBooks);
router.get('/recent/list', getRecentBooks);

router.get('/', getBooks);
router.get('/:id', getBookById);

router.post('/', protect, authorize('seller', 'admin'), upload.array('images', 5), createBook);
router.put('/:id', protect, authorize('seller', 'admin'), upload.array('images', 5), updateBook);
router.delete('/:id', protect, authorize('seller', 'admin'), deleteBook);

router.put('/:id/approve', protect, authorize('admin'), approveBook);
router.put('/:id/reject', protect, authorize('admin'), rejectBook);

module.exports = router;
