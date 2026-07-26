const express = require('express');
const router = express.Router();
const { getWishlist, addToWishlist, removeFromWishlist } = require('../controllers/wishlistController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getWishlist);
router.post('/:bookId', addToWishlist);
router.delete('/:bookId', removeFromWishlist);

module.exports = router;
