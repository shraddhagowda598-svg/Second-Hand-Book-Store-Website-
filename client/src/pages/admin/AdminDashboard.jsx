import React, { useEffect, useState } from 'react';
import * as miscApi from '../../api/misc';

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    miscApi
      .getAnalytics()
      .then((res) => setAnalytics(res.analytics))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="panel-header">
        <h1>Admin Dashboard</h1>
        <p>Platform overview and analytics</p>
      </div>
      <div className="panel-content">
        {loading ? (
          <p>Loading analytics...</p>
        ) : (
          <>
            <div className="stats-container">
              <div className="stat-card">
                <h3>{analytics.totalUsers}</h3>
                <p>Total Users</p>
              </div>
              <div className="stat-card">
                <h3>{analytics.totalBuyers}</h3>
                <p>Buyers</p>
              </div>
              <div className="stat-card">
                <h3>{analytics.totalSellers}</h3>
                <p>Sellers</p>
              </div>
              <div className="stat-card">
                <h3>{analytics.totalBooks}</h3>
                <p>Total Books</p>
              </div>
              <div className="stat-card">
                <h3>{analytics.pendingBooks}</h3>
                <p>Pending Approval</p>
              </div>
              <div className="stat-card">
                <h3>{analytics.totalOrders}</h3>
                <p>Total Orders</p>
              </div>
              <div className="stat-card">
                <h3>₹{analytics.totalRevenue}</h3>
                <p>Total Revenue</p>
              </div>
            </div>

            <h3 style={{ marginTop: '30px' }}>Monthly Revenue</h3>
            <div style={{ marginTop: '10px' }}>
              {analytics.monthlyRevenue.length === 0 ? (
                <p>No paid orders yet</p>
              ) : (
                analytics.monthlyRevenue.map((m, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                    <span>
                      {m._id.month}/{m._id.year}
                    </span>
                    <span>
                      ₹{m.revenue} ({m.orders} orders)
                    </span>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
