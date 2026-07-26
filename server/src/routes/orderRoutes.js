const express = require('express');
const router = express.Router();
const {
  placeOrder,
  getMyOrders,
  getOrderById,
  getSellerOrders,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
  requestReturn,
} = require('../controllers/orderController');
const { downloadInvoice } = require('../controllers/invoiceController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.post('/', placeOrder);
router.get('/my', getMyOrders);
router.get('/seller/my', authorize('seller', 'admin'), getSellerOrders);
router.get('/', authorize('admin'), getAllOrders);
router.get('/:id', getOrderById);
router.put('/:id/status', authorize('seller', 'admin'), updateOrderStatus);
router.put('/:id/cancel', cancelOrder);
router.put('/:id/return', requestReturn);
router.get('/:id/invoice', downloadInvoice);

module.exports = router;
