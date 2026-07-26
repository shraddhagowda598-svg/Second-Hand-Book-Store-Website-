import React, { useState } from 'react';
import * as miscApi from '../../api/misc';
import { useAuth } from '../../context/AuthContext.jsx';

export default function BuyerProfile({ user }) {
  const { setUser } = useAuth();
  const [name, setName] = useState(user.name || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('phone', phone);
      const res = await miscApi.updateProfile(formData);
      setUser(res.user);
      setMessage('Profile updated successfully');
    } catch (err) {
      setMessage(err.friendlyMessage || 'Could not update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="panel-header">
        <h1>Your Profile</h1>
        <p>Manage your account information</p>
      </div>
      <div className="panel-content">
        <div className="profile-sections">
          <div className="profile-section">
            <div className="profile-section-header">
              <h2 className="profile-section-title">Personal Information</h2>
            </div>
            <form className="profile-section-content" onSubmit={handleSave}>
              <div className="profile-field">
                <label>Email</label>
                <input type="email" value={user.email} readOnly />
              </div>
              <div className="profile-field">
                <label>Full Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your full name" />
              </div>
              <div className="profile-field">
                <label>Phone Number</label>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Enter your phone number" />
              </div>
              {message && <p style={{ fontSize: '14px', color: '#28A745' }}>{message}</p>}
              <div className="profile-actions">
                <button className="btn btn-primary" type="submit" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
