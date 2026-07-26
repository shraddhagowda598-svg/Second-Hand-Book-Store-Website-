import React, { useEffect, useState } from 'react';
import * as ordersApi from '../../api/orders';
import * as miscApi from '../../api/misc';

export default function AdminManageOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ordersApi
      .getAllOrders()
      .then((res) => setOrders(res.orders))
      .finally(() => setLoading(false));
  }, []);

  const handleExport = () => {
    const token = localStorage.getItem('bookmeup_token');
    fetch(miscApi.exportOrdersCsvUrl(), { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'orders-export.csv';
        a.click();
        window.URL.revokeObjectURL(url);
      });
  };

  return (
    <div>
      <div className="panel-header">
        <h1>Manage Orders</h1>
        <p>All orders placed on the platform</p>
      </div>
      <div className="panel-content">
        <button className="btn btn-outline" onClick={handleExport} style={{ marginBottom: '15px' }}>
          Export Orders CSV
        </button>

        {loading ? (
          <p>Loading orders...</p>
        ) : orders.length === 0 ? (
          <p>No orders yet</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '2px solid #E0E0E0' }}>
                <th style={{ padding: '10px' }}>Order #</th>
                <th style={{ padding: '10px' }}>Buyer</th>
                <th style={{ padding: '10px' }}>Total</th>
                <th style={{ padding: '10px' }}>Payment</th>
                <th style={{ padding: '10px' }}>Status</th>
                <th style={{ padding: '10px' }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o._id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '10px' }}>{o.orderNumber}</td>
                  <td style={{ padding: '10px' }}>{o.buyer?.name}</td>
                  <td style={{ padding: '10px' }}>₹{o.grandTotal}</td>
                  <td style={{ padding: '10px' }}>
                    {o.paymentMethod} ({o.paymentStatus})
                  </td>
                  <td style={{ padding: '10px' }}>{o.orderStatus}</td>
                  <td style={{ padding: '10px' }}>{new Date(o.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
