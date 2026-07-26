import React, { useState } from 'react';
import * as miscApi from '../../api/misc';
import { useAuth } from '../../context/AuthContext.jsx';

export default function SellerProfile({ user }) {
  const { setUser } = useAuth();
  const [name, setName] = useState(user.name || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [storeName, setStoreName] = useState(user.storeName || '');
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
      formData.append('storeName', storeName);
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
        <h1>Seller Profile</h1>
        <p>Manage your store and account information</p>
      </div>
      <div className="panel-content">
        <div className="profile-sections">
          <div className="profile-section">
            <div className="profile-section-header">
              <h2 className="profile-section-title">Store Information</h2>
              {user.sellerVerified && <span className="status-badge" style={{ backgroundColor: '#28A745', color: 'white' }}>Verified Seller</span>}
            </div>
            <form className="profile-section-content" onSubmit={handleSave}>
              <div className="profile-field">
                <label>Email</label>
                <input type="email" value={user.email} readOnly />
              </div>
              <div className="profile-field">
                <label>Full Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="profile-field">
                <label>Store Name</label>
                <input type="text" value={storeName} onChange={(e) => setStoreName(e.target.value)} placeholder="Your store's display name" />
              </div>
              <div className="profile-field">
                <label>Phone Number</label>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
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
