import React, { useEffect, useState } from 'react';
import * as miscApi from '../../api/misc';
import client from '../../api/client';

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    client
      .get('/payments')
      .then((res) => setPayments(res.data.payments))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleRefund = async (id) => {
    if (!window.confirm('Mark this payment as refunded?')) return;
    await client.put(`/payments/${id}/refund`);
    load();
  };

  return (
    <div>
      <div className="panel-header">
        <h1>Payments</h1>
        <p>All payment transactions</p>
      </div>
      <div className="panel-content">
        {loading ? (
          <p>Loading payments...</p>
        ) : payments.length === 0 ? (
          <p>No payments recorded yet</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '2px solid #E0E0E0' }}>
                <th style={{ padding: '10px' }}>User</th>
                <th style={{ padding: '10px' }}>Method</th>
                <th style={{ padding: '10px' }}>Amount</th>
                <th style={{ padding: '10px' }}>Status</th>
                <th style={{ padding: '10px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p._id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '10px' }}>{p.user?.name}</td>
                  <td style={{ padding: '10px' }}>{p.method}</td>
                  <td style={{ padding: '10px' }}>₹{p.amount}</td>
                  <td style={{ padding: '10px' }}>{p.status}</td>
                  <td style={{ padding: '10px' }}>
                    {p.status === 'success' && (
                      <button className="btn-small btn-outline" onClick={() => handleRefund(p._id)}>
                        Refund
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
