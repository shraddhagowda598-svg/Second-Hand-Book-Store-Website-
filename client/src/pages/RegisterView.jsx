import React, { useState } from 'react';
import * as authApi from '../api/auth';

export default function RegisterView({ onSwitchView, onRegistered }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'buyer',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match!");
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setSubmitting(true);
    try {
      const res = await authApi.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });
      onRegistered({ userId: res.userId, email: formData.email });
    } catch (err) {
      setError(err.friendlyMessage || 'Registration failed');
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
          <p className="brand-tagline">Create Your Account</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              className="form-input"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              className="form-input"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
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
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input
              className="form-input"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Account Type</label>
            <select className="form-input" name="role" value={formData.role} onChange={handleChange}>
              <option value="buyer">Buyer</option>
              <option value="seller">Seller</option>
            </select>
          </div>
          {error && (
            <div className="form-group" style={{ color: '#D9534F', fontSize: '14px' }}>
              {error}
            </div>
          )}
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Creating Account...' : 'Register'}
          </button>
        </form>
        <div className="auth-toggle">
          Already have an account? <a onClick={onSwitchView}>Login here</a>
        </div>
      </div>
    </div>
  );
}
