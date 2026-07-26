const express = require('express');
const router = express.Router();
const {
  getUsers,
  toggleUserActive,
  verifySeller,
  deleteUser,
  getAnalytics,
  exportOrdersCSV,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));

router.get('/users', getUsers);
router.put('/users/:id/toggle-active', toggleUserActive);
router.put('/users/:id/verify-seller', verifySeller);
router.delete('/users/:id', deleteUser);

router.get('/analytics', getAnalytics);
router.get('/export/orders', exportOrdersCSV);

module.exports = router;
