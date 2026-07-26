import React, { useState } from 'react';
import * as authApi from '../api/auth';
import { useAuth } from '../context/AuthContext.jsx';

export default function VerifyOtpView({ userId, email, onVerified, onBackToLogin }) {
  const { loginWithToken } = useAuth();
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await authApi.verifyOtp({ userId, otp });
      loginWithToken(res.token, res.user);
      onVerified();
    } catch (err) {
      setError(err.friendlyMessage || 'Verification failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setInfo('');
    try {
      await authApi.resendOtp({ userId });
      setInfo('A new OTP has been sent to your email.');
    } catch (err) {
      setError(err.friendlyMessage || 'Could not resend OTP');
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
          <p className="brand-tagline">Verify your email</p>
        </div>
        <p style={{ fontSize: '14px', color: '#6C757D', marginBottom: '20px' }}>
          We sent a 6-digit code to <strong>{email}</strong>. In development without SMTP configured,
          check the server console log for the code.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">OTP Code</label>
            <input
              className="form-input"
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter 6-digit code"
              maxLength={6}
              required
            />
          </div>
          {error && (
            <div className="form-group" style={{ color: '#D9534F', fontSize: '14px' }}>
              {error}
            </div>
          )}
          {info && (
            <div className="form-group" style={{ color: '#28A745', fontSize: '14px' }}>
              {info}
            </div>
          )}
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Verifying...' : 'Verify & Continue'}
          </button>
        </form>
        <div className="auth-toggle">
          <a onClick={handleResend}>Resend code</a> &nbsp;|&nbsp; <a onClick={onBackToLogin}>Back to login</a>
        </div>
      </div>
    </div>
  );
}
