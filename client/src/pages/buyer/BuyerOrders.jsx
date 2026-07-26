import React, { useEffect, useState } from 'react';
import * as ordersApi from '../../api/orders';

const statusLabel = {
  placed: 'Placed',
  confirmed: 'Confirmed',
  shipped: 'Shipped',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  returned: 'Returned',
};

export default function BuyerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    ordersApi
      .getMyOrders()
      .then((res) => setOrders(res.orders))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleCancel = async (orderId) => {
    const reason = window.prompt('Reason for cancellation (optional):') || 'Changed my mind';
    try {
      await ordersApi.cancelOrder(orderId, reason);
      load();
    } catch (err) {
      alert(err.friendlyMessage || 'Could not cancel order');
    }
  };

  const handleDownloadInvoice = (orderId) => {
    const token = localStorage.getItem('bookmeup_token');
    fetch(ordersApi.invoiceUrl(orderId), { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-${orderId}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      });
  };

  return (
    <div>
      <div className="panel-header">
        <h1>Your Orders</h1>
        <p>Track your order history</p>
      </div>
      <div className="panel-content">
        {loading ? (
          <div className="empty-state">
            <div className="empty-state-icon">⏳</div>
            <h3>Loading orders...</h3>
          </div>
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📦</div>
            <h3>No orders yet</h3>
            <p>Your order history will appear here</p>
          </div>
        ) : (
          <div>
            {orders.map((order) => (
              <div key={order._id} className="checkout-summary" style={{ marginBottom: '20px' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '15px',
                  }}
                >
                  <h3>Order #{order.orderNumber}</h3>
                  <span className={`status-badge status-${order.orderStatus === 'delivered' ? 'delivered' : 'pending'}`}>
                    {statusLabel[order.orderStatus] || order.orderStatus}
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <p>
                      <strong>Date:</strong> {new Date(order.createdAt).toLocaleString()}
                    </p>
                    <p>
                      <strong>Payment Method:</strong> {order.paymentMethod} ({order.paymentStatus})
                    </p>
                    <p>
                      <strong>Total:</strong> ₹{order.grandTotal}
                    </p>
                  </div>
                  <div>
                    <p>
                      <strong>Shipping to:</strong> {order.shippingAddress?.fullName}
                    </p>
                    <p>
                      <strong>Items:</strong> {order.items.length} book(s)
                    </p>
                  </div>
                </div>
                <div style={{ marginTop: '15px' }}>
                  <h4>Order Items:</h4>
                  {order.items.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '8px 0',
                        borderBottom: '1px solid #f0f0f0',
                      }}
                    >
                      <span>
                        {item.title} (Qty: {item.quantity})
                      </span>
                      <span>₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                  <button className="btn-small btn-outline" onClick={() => handleDownloadInvoice(order._id)}>
                    Download Invoice
                  </button>
                  {!['shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned'].includes(
                    order.orderStatus
                  ) && (
                    <button className="btn-small btn-outline" onClick={() => handleCancel(order._id)}>
                      Cancel Order
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
