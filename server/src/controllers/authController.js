const crypto = require('crypto');
const User = require('../models/User');
const Cart = require('../models/Cart');
const Wishlist = require('../models/Wishlist');
const generateToken = require('../utils/generateToken');
const sendEmail = require('../utils/sendEmail');
const { asyncHandler } = require('../middleware/errorHandler');

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const sanitizeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  avatar: user.avatar,
  isVerified: user.isVerified,
  storeName: user.storeName,
  sellerVerified: user.sellerVerified,
  earnings: user.earnings,
  addresses: user.addresses,
  createdAt: user.createdAt,
});

// @route POST /api/auth/register
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Name, email and password are required' });
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return res.status(400).json({ success: false, message: 'An account with this email already exists' });
  }

  const otpCode = generateOTP();
  const user = await User.create({
    name,
    email,
    password,
    phone,
    role: ['buyer', 'seller'].includes(role) ? role : 'buyer',
    otpCode,
    otpExpires: Date.now() + 10 * 60 * 1000,
  });

  await Cart.create({ user: user._id, items: [] });
  await Wishlist.create({ user: user._id, books: [] });

  await sendEmail({
    to: user.email,
    subject: 'Verify your BookMeUp account',
    html: `<p>Hi ${user.name},</p><p>Your OTP verification code is <b>${otpCode}</b>. It expires in 10 minutes.</p>`,
  });

  res.status(201).json({
    success: true,
    message: 'Registration successful. Please verify the OTP sent to your email.',
    userId: user._id,
  });
});

// @route POST /api/auth/verify-otp
exports.verifyOtp = asyncHandler(async (req, res) => {
  const { userId, otp } = req.body;
  const user = await User.findById(userId).select('+otpCode +otpExpires');

  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  if (user.isVerified) {
    return res.status(400).json({ success: false, message: 'Account already verified' });
  }
  if (!user.otpCode || user.otpCode !== otp || user.otpExpires < Date.now()) {
    return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
  }

  user.isVerified = true;
  user.otpCode = undefined;
  user.otpExpires = undefined;
  await user.save();

  res.json({
    success: true,
    message: 'Account verified successfully',
    token: generateToken(user._id),
    user: sanitizeUser(user),
  });
});

// @route POST /api/auth/resend-otp
exports.resendOtp = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  const otpCode = generateOTP();
  user.otpCode = otpCode;
  user.otpExpires = Date.now() + 10 * 60 * 1000;
  await user.save();

  await sendEmail({
    to: user.email,
    subject: 'Your new BookMeUp OTP',
    html: `<p>Your new OTP code is <b>${otpCode}</b>. It expires in 10 minutes.</p>`,
  });

  res.json({ success: true, message: 'OTP resent successfully' });
});

// @route POST /api/auth/login
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }
  if (!user.isActive) {
    return res.status(403).json({ success: false, message: 'Your account has been deactivated' });
  }

  user.lastLogin = new Date();
  await user.save();

  res.json({
    success: true,
    token: generateToken(user._id),
    user: sanitizeUser(user),
  });
});

// @route GET /api/auth/me
exports.getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: sanitizeUser(req.user) });
});

// @route POST /api/auth/forgot-password
exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() });

  // Do not reveal whether the email exists
  if (!user) {
    return res.json({ success: true, message: 'If that email exists, a reset link has been sent' });
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.resetPasswordExpires = Date.now() + 30 * 60 * 1000;
  await user.save();

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
  await sendEmail({
    to: user.email,
    subject: 'BookMeUp Password Reset',
    html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. This link expires in 30 minutes.</p>`,
  });

  res.json({ success: true, message: 'If that email exists, a reset link has been sent' });
});

// @route PUT /api/auth/reset-password/:token
exports.resetPassword = asyncHandler(async (req, res) => {
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  }).select('+resetPasswordToken +resetPasswordExpires');

  if (!user) {
    return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.json({ success: true, message: 'Password reset successful. Please log in.' });
});
