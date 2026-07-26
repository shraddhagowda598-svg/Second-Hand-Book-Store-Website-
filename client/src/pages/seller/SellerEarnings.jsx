import React, { useState } from 'react';
import * as miscApi from '../../api/misc';
import { useAuth } from '../../context/AuthContext.jsx';

export default function SellerEarnings() {
  const { user, setUser } = useAuth();
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleWithdraw = async (e) => {
    e.preventDefault();
    setMessage('');
    const value = Number(amount);
    if (!value || value <= 0) {
      setMessage('Enter a valid amount');
      return;
    }
    setSubmitting(true);
    try {
      const res = await miscApi.withdrawEarnings(value);
      setUser({ ...user, earnings: res.earnings });
      setMessage('Withdrawal request submitted successfully');
      setAmount('');
    } catch (err) {
      setMessage(err.friendlyMessage || 'Withdrawal failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="panel-header">
        <h1>Earnings</h1>
        <p>Track and withdraw your sales earnings</p>
      </div>
      <div className="panel-content">
        <div className="stats-container">
          <div className="stat-card">
            <h3>₹{user.earnings ?? 0}</h3>
            <p>Available Earnings</p>
          </div>
          <div className="stat-card">
            <h3>₹{user.withdrawnAmount ?? 0}</h3>
            <p>Total Withdrawn</p>
          </div>
        </div>

        <form onSubmit={handleWithdraw} style={{ marginTop: '30px', maxWidth: '400px' }}>
          <div className="form-group">
            <label className="form-label">Withdraw Amount (₹)</label>
            <input className="form-input" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          {message && <p style={{ fontSize: '14px', color: '#28A745' }}>{message}</p>}
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Processing...' : 'Request Withdrawal'}
          </button>
        </form>
      </div>
    </div>
  );
}
