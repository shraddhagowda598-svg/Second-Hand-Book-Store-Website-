import React, { useState } from 'react';
import * as ordersApi from '../../api/orders';
import * as miscApi from '../../api/misc';

const emptyAddress = {
  fullName: '',
  phone: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  pincode: '',
  country: 'India',
};

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function BuyerCart({ cart, removeFromCart, updateQuantity, cartTotal, onOrderPlaced }) {
  const [checkoutStep, setCheckoutStep] = useState('cart'); // 'cart' | 'address' | 'payment' | 'confirmation'
  const [address, setAddress] = useState(emptyAddress);
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  const items = cart.items || [];

  const handleAddressChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const proceedToAddress = () => {
    if (items.length === 0) {
      setError('Your cart is empty!');
      return;
    }
    setError('');
    setCheckoutStep('address');
  };

  const proceedToPayment = () => {
    if (!address.fullName || !address.phone || !address.line1 || !address.city || !address.pincode) {
      setError('Please fill in all required address fields!');
      return;
    }
    setError('');
    setCheckoutStep('payment');
  };

  const placeCodOrder = async () => {
    setPlacing(true);
    setError('');
    try {
      const res = await ordersApi.placeOrder({ shippingAddress: address, paymentMethod: 'COD' });
      setConfirmedOrder(res.order);
      setCheckoutStep('confirmation');
    } catch (err) {
      setError(err.friendlyMessage || 'Could not place order');
    } finally {
      setPlacing(false);
    }
  };

  const placeRazorpayOrder = async () => {
    setPlacing(true);
    setError('');
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setError('Could not load Razorpay checkout. Check your internet connection.');
        setPlacing(false);
        return;
      }

      const { razorpayOrder, keyId } = await miscApi.createRazorpayOrder(cartTotal);

      // Place the order in our system first (pending payment), matching the COD path
      const orderRes = await ordersApi.placeOrder({ shippingAddress: address, paymentMethod: 'Razorpay' });
      const order = orderRes.order;

      const rzp = new window.Razorpay({
        key: keyId,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'BookMeUp',
        description: `Order ${order.orderNumber}`,
        order_id: razorpayOrder.id,
        handler: async (response) => {
          try {
            await miscApi.verifyRazorpayPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: order._id,
            });
            setConfirmedOrder(order);
            setCheckoutStep('confirmation');
          } catch (err) {
            setError(err.friendlyMessage || 'Payment verification failed');
          } finally {
            setPlacing(false);
          }
        },
        modal: { ondismiss: () => setPlacing(false) },
        prefill: { name: address.fullName, contact: address.phone },
        theme: { color: '#4A6CF7' },
      });
      rzp.open();
    } catch (err) {
      setError(err.friendlyMessage || 'Razorpay is not available right now');
      setPlacing(false);
    }
  };

  const handlePlaceOrder = () => {
    if (paymentMethod === 'COD') placeCodOrder();
    else placeRazorpayOrder();
  };

  if (checkoutStep === 'confirmation' && confirmedOrder) {
    return (
      <div className="panel-content">
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div className="success-icon">✅</div>
          <h2>Order Placed Successfully!</h2>
          <p>Your order <strong>{confirmedOrder.orderNumber}</strong> has been confirmed.</p>
          <p>Payment method: {confirmedOrder.paymentMethod} &nbsp;|&nbsp; Total: ₹{confirmedOrder.grandTotal}</p>
          <div className="success-actions" style={{ marginTop: '20px' }}>
            <button className="btn btn-primary" onClick={onOrderPlaced}>
              View My Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="panel-header">
        <h1>Shopping Cart</h1>
        <p>Review your items and check out</p>
      </div>
      <div className="panel-content">
        <div className="checkout-steps">
          <span className={`checkout-step ${checkoutStep === 'cart' ? 'active' : ''}`}>1. Cart</span>
          <span className={`checkout-step ${checkoutStep === 'address' ? 'active' : ''}`}>2. Address</span>
          <span className={`checkout-step ${checkoutStep === 'payment' ? 'active' : ''}`}>3. Payment</span>
        </div>

        {error && <p style={{ color: '#D9534F', marginTop: '10px' }}>{error}</p>}

        {checkoutStep === 'cart' && (
          <>
            {items.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🛒</div>
                <h3>Your cart is empty</h3>
                <p>Browse our books and add something you'll love</p>
              </div>
            ) : (
              <>
                <div className="cart-items">
                  {items.map(
                    (item) =>
                      item.book && (
                        <div key={item.book._id} className="cart-item">
                          <img
                            src={
                              item.book.images && item.book.images[0]
                                ? item.book.images[0]
                                : 'https://placehold.co/100x140?text=No+Image'
                            }
                            alt={item.book.title}
                            className="cart-item-image"
                          />
                          <div className="cart-item-details">
                            <div className="cart-item-title">{item.book.title}</div>
                            <div className="cart-item-author">by {item.book.author}</div>
                            <div className="cart-item-price">₹{item.book.finalPrice} x {item.quantity}</div>
                          </div>
                          <div className="cart-item-actions">
                            <button className="btn-small btn-outline" onClick={() => updateQuantity(item.book._id, item.quantity - 1)}>
                              -
                            </button>
                            <span>{item.quantity}</span>
                            <button className="btn-small btn-outline" onClick={() => updateQuantity(item.book._id, item.quantity + 1)}>
                              +
                            </button>
                            <button className="btn-small btn-outline" onClick={() => removeFromCart(item.book._id)}>
                              Remove
                            </button>
                          </div>
                        </div>
                      )
                  )}
                </div>
                <div className="cart-summary">
                  <h3>Total: ₹{cartTotal}</h3>
                  <button className="btn btn-primary" onClick={proceedToAddress}>
                    Proceed to Checkout
                  </button>
                </div>
              </>
            )}
          </>
        )}

        {checkoutStep === 'address' && (
          <div className="checkout-form-grid">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" name="fullName" value={address.fullName} onChange={handleAddressChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="form-input" name="phone" value={address.phone} onChange={handleAddressChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Address Line 1</label>
              <input className="form-input" name="line1" value={address.line1} onChange={handleAddressChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Address Line 2</label>
              <input className="form-input" name="line2" value={address.line2} onChange={handleAddressChange} />
            </div>
            <div className="form-group">
              <label className="form-label">City</label>
              <input className="form-input" name="city" value={address.city} onChange={handleAddressChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">State</label>
              <input className="form-input" name="state" value={address.state} onChange={handleAddressChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Pincode</label>
              <input className="form-input" name="pincode" value={address.pincode} onChange={handleAddressChange} required />
            </div>
            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '10px' }}>
              <button className="btn btn-outline" onClick={() => setCheckoutStep('cart')}>
                Back
              </button>
              <button className="btn btn-primary" onClick={proceedToPayment}>
                Continue to Payment
              </button>
            </div>
          </div>
        )}

        {checkoutStep === 'payment' && (
          <div>
            <div className="payment-methods">
              <div
                className={`payment-method-option ${paymentMethod === 'COD' ? 'selected' : ''}`}
                onClick={() => setPaymentMethod('COD')}
              >
                <div className="payment-method-icon">💵</div>
                <div className="payment-method-info">
                  <div className="payment-method-title">Cash on Delivery</div>
                  <div className="payment-method-description">Pay when your order arrives</div>
                </div>
              </div>
              <div
                className={`payment-method-option ${paymentMethod === 'Razorpay' ? 'selected' : ''}`}
                onClick={() => setPaymentMethod('Razorpay')}
              >
                <div className="payment-method-icon">💳</div>
                <div className="payment-method-info">
                  <div className="payment-method-title">Pay Online (Razorpay)</div>
                  <div className="payment-method-description">Card, UPI, netbanking & more</div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
              <button className="btn btn-outline" onClick={() => setCheckoutStep('address')} disabled={placing}>
                Back
              </button>
              <button className="btn btn-primary" onClick={handlePlaceOrder} disabled={placing}>
                {placing ? 'Processing...' : `Place Order - ₹${cartTotal}`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
