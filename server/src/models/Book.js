const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, index: true },
    author: { type: String, required: true, trim: true, index: true },
    publisher: { type: String, trim: true },
    isbn: { type: String, trim: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    language: { type: String, enum: ['English', 'Hindi', 'Kannada', 'Other'], default: 'English' },
    condition: {
      type: String,
      enum: ['Like New', 'Good', 'Fair', 'Acceptable'],
      default: 'Good',
    },
    description: { type: String, default: '' },

    price: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0, max: 100 }, // percent
    stock: { type: Number, required: true, default: 1, min: 0 },

    images: [{ type: String }],

    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    ratingAverage: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },

    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    rejectionReason: { type: String },

    isFeatured: { type: Boolean, default: false },
    viewCount: { type: Number, default: 0 },
    soldCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

bookSchema.virtual('finalPrice').get(function () {
  return Math.round(this.price - (this.price * this.discount) / 100);
});

bookSchema.set('toJSON', { virtuals: true });
bookSchema.set('toObject', { virtuals: true });

bookSchema.index({ title: 'text', author: 'text', publisher: 'text', description: 'text' });

module.exports = mongoose.model('Book', bookSchema);
