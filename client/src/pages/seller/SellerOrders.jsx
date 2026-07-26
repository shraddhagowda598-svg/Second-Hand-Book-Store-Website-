import React, { useEffect, useState } from 'react';
import * as ordersApi from '../../api/orders';

const nextStatusOptions = ['confirmed', 'shipped', 'out_for_delivery', 'delivered'];

export default function SellerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    ordersApi
      .getSellerOrders()
      .then((res) => setOrders(res.orders))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleUpdateStatus = async (orderId, status) => {
    try {
      await ordersApi.updateOrderStatus(orderId, status, `Marked as ${status} by seller`);
      load();
    } catch (err) {
      alert(err.friendlyMessage || 'Could not update order status');
    }
  };

  return (
    <div>
      <div className="panel-header">
        <h1>Orders</h1>
        <p>Orders containing your books</p>
      </div>
      <div className="panel-content">
        {loading ? (
          <p>Loading orders...</p>
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📦</div>
            <h3>No orders yet</h3>
            <p>Orders for your books will show up here</p>
          </div>
        ) : (
          orders.map((order) => (
            <div key={order._id} className="checkout-summary" style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3>Order #{order.orderNumber}</h3>
                <span className="status-badge">{order.orderStatus}</span>
              </div>
              <p>
                <strong>Payment:</strong> {order.paymentMethod} ({order.paymentStatus})
              </p>
              <p>
                <strong>Total:</strong> ₹{order.grandTotal}
              </p>
              <div style={{ marginTop: '10px' }}>
                {order.items.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                    <span>
                      {item.title} x{item.quantity}
                    </span>
                    <span>₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
              {!['delivered', 'cancelled', 'returned'].includes(order.orderStatus) && (
                <div style={{ marginTop: '10px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {nextStatusOptions.map((status) => (
                    <button
                      key={status}
                      className="btn-small btn-outline"
                      onClick={() => handleUpdateStatus(order._id, status)}
                    >
                      Mark {status.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
