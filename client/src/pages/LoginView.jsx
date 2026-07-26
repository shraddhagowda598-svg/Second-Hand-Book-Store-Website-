import React, { useState } from 'react';
import * as authApi from '../api/auth';
import { useAuth } from '../context/AuthContext.jsx';

export default function LoginView({ onSwitchView }) {
  const { loginWithToken } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await authApi.login(formData);
      loginWithToken(res.token, res.user);
    } catch (err) {
      setError(err.friendlyMessage || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <div className="auth-header">
          <div className="logo-container">
            <div className="logo-icon">📚✨</div>
            <h1 className="brand-title">BOOKMEUP</h1>
          </div>
          <p className="brand-tagline">Your Second-Hand Book Marketplace</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              className="form-input"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="form-input"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </div>
          {error && (
            <div className="form-group" style={{ color: '#D9534F', fontSize: '14px' }}>
              {error}
            </div>
          )}
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
        <div className="auth-toggle">
          Don't have an account? <a onClick={onSwitchView}>Register here</a>
        </div>
        <p style={{ textAlign: 'center', fontSize: '12px', color: '#6C757D', marginTop: '16px' }}>
          Your role (buyer, seller, or admin) is determined by your account — set it when you register.
        </p>
      </div>
    </div>
  );
}
