import React, { useEffect, useState } from 'react';
import * as miscApi from '../../api/misc';

export default function AdminManageUsers() {
  const [users, setUsers] = useState([]);
  const [filterRole, setFilterRole] = useState('all');
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    miscApi
      .getAdminUsers(filterRole === 'all' ? undefined : filterRole)
      .then((res) => setUsers(res.users))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterRole]);

  const handleToggleActive = async (id) => {
    await miscApi.toggleUserActive(id);
    load();
  };

  const handleVerifySeller = async (id) => {
    await miscApi.verifySeller(id);
    load();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user permanently?')) return;
    await miscApi.deleteUser(id);
    load();
  };

  return (
    <div>
      <div className="panel-header">
        <h1>Manage Users</h1>
        <p>View and manage buyers, sellers, and admins</p>
      </div>
      <div className="panel-content">
        <div className="form-group" style={{ maxWidth: '250px' }}>
          <label className="form-label">Filter by role</label>
          <select className="form-input" value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
            <option value="all">All</option>
            <option value="buyer">Buyers</option>
            <option value="seller">Sellers</option>
            <option value="admin">Admins</option>
          </select>
        </div>

        {loading ? (
          <p>Loading users...</p>
        ) : (
          <table className="admin-table" style={{ width: '100%', marginTop: '15px', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '2px solid #E0E0E0' }}>
                <th style={{ padding: '10px' }}>Name</th>
                <th style={{ padding: '10px' }}>Email</th>
                <th style={{ padding: '10px' }}>Role</th>
                <th style={{ padding: '10px' }}>Status</th>
                <th style={{ padding: '10px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '10px' }}>
                    {u.name} {u.role === 'seller' && u.sellerVerified ? '✅' : ''}
                  </td>
                  <td style={{ padding: '10px' }}>{u.email}</td>
                  <td style={{ padding: '10px' }}>{u.role}</td>
                  <td style={{ padding: '10px' }}>{u.isActive ? 'Active' : 'Deactivated'}</td>
                  <td style={{ padding: '10px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    <button className="btn-small btn-outline" onClick={() => handleToggleActive(u._id)}>
                      {u.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    {u.role === 'seller' && !u.sellerVerified && (
                      <button className="btn-small btn-outline" onClick={() => handleVerifySeller(u._id)}>
                        Verify
                      </button>
                    )}
                    {u.role !== 'admin' && (
                      <button className="btn-small btn-outline" onClick={() => handleDelete(u._id)}>
                        Delete
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
