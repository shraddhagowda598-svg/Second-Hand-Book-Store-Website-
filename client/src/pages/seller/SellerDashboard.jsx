import React, { useEffect, useState } from 'react';
import * as booksApi from '../../api/books';
import * as ordersApi from '../../api/orders';
import { useAuth } from '../../context/AuthContext.jsx';

export default function SellerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalBooks: 0, pendingBooks: 0, totalOrders: 0, revenue: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([booksApi.getBooks({ seller: user._id, status: 'all', limit: 100 }), ordersApi.getSellerOrders()])
      .then(([booksRes, ordersRes]) => {
        const orders = ordersRes.orders || [];
        const revenue = orders
          .filter((o) => o.paymentStatus === 'paid')
          .reduce((sum, o) => {
            const mine = o.items.filter((i) => i.seller === user._id || i.seller?._id === user._id);
            return sum + mine.reduce((s, i) => s + i.price * i.quantity, 0);
          }, 0);
        setStats({
          totalBooks: booksRes.total ?? booksRes.books.length,
          pendingBooks: booksRes.books.filter((b) => b.status === 'pending').length,
          totalOrders: orders.length,
          revenue,
        });
      })
      .finally(() => setLoading(false));
  }, [user._id]);

  return (
    <div>
      <div className="panel-header">
        <h1>Seller Dashboard</h1>
        <p>Welcome back, {user.storeName || user.name}</p>
      </div>
      <div className="panel-content">
        {loading ? (
          <p>Loading your stats...</p>
        ) : (
          <div className="stats-container">
            <div className="stat-card">
              <h3>{stats.totalBooks}</h3>
              <p>Total Listings</p>
            </div>
            <div className="stat-card">
              <h3>{stats.pendingBooks}</h3>
              <p>Pending Approval</p>
            </div>
            <div className="stat-card">
              <h3>{stats.totalOrders}</h3>
              <p>Orders Received</p>
            </div>
            <div className="stat-card">
              <h3>₹{stats.revenue}</h3>
              <p>Revenue (paid orders)</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
