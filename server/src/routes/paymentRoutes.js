const express = require('express');
const router = express.Router();
const {
  createRazorpayOrder,
  verifyRazorpayPayment,
  getMyPayments,
  getAllPayments,
  refundPayment,
} = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.post('/razorpay/create-order', createRazorpayOrder);
router.post('/razorpay/verify', verifyRazorpayPayment);
router.get('/my', getMyPayments);
router.get('/', authorize('admin'), getAllPayments);
router.put('/:id/refund', authorize('admin'), refundPayment);

module.exports = router;
