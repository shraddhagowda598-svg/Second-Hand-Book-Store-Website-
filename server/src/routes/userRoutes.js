const express = require('express');
const router = express.Router();
const {
  updateProfile,
  changePassword,
  addAddress,
  updateAddress,
  deleteAddress,
  withdrawEarnings,
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(protect);

router.put('/profile', upload.single('avatar'), updateProfile);
router.put('/change-password', changePassword);

router.post('/addresses', addAddress);
router.put('/addresses/:addressId', updateAddress);
router.delete('/addresses/:addressId', deleteAddress);

router.post('/withdraw', authorize('seller'), withdrawEarnings);

module.exports = router;
