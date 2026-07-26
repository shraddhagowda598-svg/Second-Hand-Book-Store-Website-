const express = require('express');
const router = express.Router();
const {
  getBookReviews,
  addReview,
  updateReview,
  deleteReview,
} = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

router.get('/book/:bookId', getBookReviews);
router.post('/book/:bookId', protect, addReview);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);

module.exports = router;
