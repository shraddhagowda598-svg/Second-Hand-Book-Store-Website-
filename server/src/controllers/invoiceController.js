const PDFDocument = require('pdfkit');
const Order = require('../models/Order');
const { asyncHandler } = require('../middleware/errorHandler');

// @route GET /api/orders/:id/invoice
exports.downloadInvoice = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('buyer', 'name email');
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

  const isBuyer = order.buyer._id.toString() === req.user._id.toString();
  if (!isBuyer && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=invoice-${order.orderNumber}.pdf`);

  const doc = new PDFDocument({ margin: 50 });
  doc.pipe(res);

  doc.fontSize(20).text('BookMeUp', { align: 'left' });
  doc.fontSize(10).text('Second-Hand Book Store', { align: 'left' });
  doc.moveDown();
  doc.fontSize(14).text(`Invoice - Order #${order.orderNumber}`);
  doc.fontSize(10).text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`);
  doc.text(`Payment Method: ${order.paymentMethod}`);
  doc.text(`Payment Status: ${order.paymentStatus}`);
  doc.moveDown();

  doc.fontSize(12).text('Billed To:');
  doc.fontSize(10).text(order.buyer.name);
  doc.text(order.buyer.email);
  doc.text(`${order.shippingAddress.line1}, ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}`);
  doc.moveDown();

  doc.fontSize(12).text('Items:');
  doc.moveDown(0.5);
  order.items.forEach((item) => {
    doc.fontSize(10).text(
      `${item.title}  x${item.quantity}  -  Rs.${item.price * item.quantity}`
    );
  });

  doc.moveDown();
  doc.fontSize(10).text(`Items Total: Rs.${order.itemsTotal}`);
  doc.text(`Discount: -Rs.${order.discountTotal}`);
  doc.text(`Shipping Fee: Rs.${order.shippingFee}`);
  doc.fontSize(12).text(`Grand Total: Rs.${order.grandTotal}`, { underline: true });

  doc.moveDown(2);
  doc.fontSize(9).text('Thank you for shopping with BookMeUp!', { align: 'center' });

  doc.end();
});
