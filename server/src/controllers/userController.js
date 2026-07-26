const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');

// @route PUT /api/users/profile
exports.updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, storeName } = req.body;
  const user = await User.findById(req.user._id);

  if (name) user.name = name;
  if (phone) user.phone = phone;
  if (storeName && (user.role === 'seller' || user.role === 'admin')) user.storeName = storeName;
  if (req.file) user.avatar = `/uploads/${req.file.filename}`;

  await user.save();
  res.json({ success: true, user });
});

// @route PUT /api/users/change-password  { currentPassword, newPassword }
exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');

  if (!(await user.matchPassword(currentPassword))) {
    return res.status(400).json({ success: false, message: 'Current password is incorrect' });
  }

  user.password = newPassword;
  await user.save();
  res.json({ success: true, message: 'Password changed successfully' });
});

// @route POST /api/users/addresses
exports.addAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (req.body.isDefault) {
    user.addresses.forEach((a) => (a.isDefault = false));
  }
  user.addresses.push(req.body);
  await user.save();
  res.status(201).json({ success: true, addresses: user.addresses });
});

// @route PUT /api/users/addresses/:addressId
exports.updateAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const address = user.addresses.id(req.params.addressId);
  if (!address) return res.status(404).json({ success: false, message: 'Address not found' });

  Object.assign(address, req.body);
  if (req.body.isDefault) {
    user.addresses.forEach((a) => {
      if (a._id.toString() !== req.params.addressId) a.isDefault = false;
    });
  }
  await user.save();
  res.json({ success: true, addresses: user.addresses });
});

// @route DELETE /api/users/addresses/:addressId
exports.deleteAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  user.addresses = user.addresses.filter((a) => a._id.toString() !== req.params.addressId);
  await user.save();
  res.json({ success: true, addresses: user.addresses });
});

// @route POST /api/users/withdraw  (seller)  { amount }
exports.withdrawEarnings = asyncHandler(async (req, res) => {
  const { amount } = req.body;
  const user = await User.findById(req.user._id);

  if (amount > user.earnings) {
    return res.status(400).json({ success: false, message: 'Withdrawal amount exceeds available earnings' });
  }

  user.earnings -= amount;
  user.withdrawnAmount += amount;
  await user.save();

  res.json({ success: true, message: 'Withdrawal request submitted', earnings: user.earnings });
});
