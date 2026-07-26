import React, { useState } from 'react';
import AdminDashboard from './AdminDashboard.jsx';
import AdminManageUsers from './AdminManageUsers.jsx';
import AdminManageBooks from './AdminManageBooks.jsx';
import AdminManageOrders from './AdminManageOrders.jsx';
import AdminPayments from './AdminPayments.jsx';

export default function AdminPanel({ onLogout }) {
  const [activePage, setActivePage] = useState('dashboard');

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'manageUsers':
        return <AdminManageUsers />;
      case 'manageBooks':
        return <AdminManageBooks />;
      case 'manageOrders':
        return <AdminManageOrders />;
      case 'payments':
        return <AdminPayments />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div>
      <nav className="navbar">
        <div className="nav-container">
          <div className="logo">
            <span className="logo-icon-nav">📚</span>
            BookMeUp - Admin
          </div>
          <ul className="nav-links">
            <li>
              <a className={activePage === 'dashboard' ? 'active' : ''} onClick={() => setActivePage('dashboard')}>
                Dashboard
              </a>
            </li>
            <li>
              <a className={activePage === 'manageUsers' ? 'active' : ''} onClick={() => setActivePage('manageUsers')}>
                Manage Users
              </a>
            </li>
            <li>
              <a className={activePage === 'manageBooks' ? 'active' : ''} onClick={() => setActivePage('manageBooks')}>
                Manage Books
              </a>
            </li>
            <li>
              <a className={activePage === 'manageOrders' ? 'active' : ''} onClick={() => setActivePage('manageOrders')}>
                Manage Orders
              </a>
            </li>
            <li>
              <a className={activePage === 'payments' ? 'active' : ''} onClick={() => setActivePage('payments')}>
                Payments
              </a>
            </li>
            <li>
              <a onClick={onLogout}>Logout</a>
            </li>
          </ul>
        </div>
      </nav>

      <div className="panel">
        <div className="container">{renderPage()}</div>
      </div>
    </div>
  );
}
