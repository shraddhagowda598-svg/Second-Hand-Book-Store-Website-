const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    method: { type: String, enum: ['COD', 'Razorpay'], required: true },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'success', 'failed', 'refunded'],
      default: 'pending',
    },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,
    refundId: String,
    refundStatus: { type: String, enum: ['none', 'initiated', 'completed'], default: 'none' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);
