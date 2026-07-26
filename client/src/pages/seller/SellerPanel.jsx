import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import SellerDashboard from './SellerDashboard.jsx';
import SellerAddBook from './SellerAddBook.jsx';
import SellerMyBooks from './SellerMyBooks.jsx';
import SellerOrders from './SellerOrders.jsx';
import SellerEarnings from './SellerEarnings.jsx';
import SellerProfile from './SellerProfile.jsx';

export default function SellerPanel({ onLogout }) {
  const { user } = useAuth();
  const [activePage, setActivePage] = useState('dashboard');

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <SellerDashboard />;
      case 'addBook':
        return <SellerAddBook onSaved={() => setActivePage('myBooks')} />;
      case 'myBooks':
        return <SellerMyBooks />;
      case 'orders':
        return <SellerOrders />;
      case 'earnings':
        return <SellerEarnings />;
      case 'profile':
        return <SellerProfile user={user} />;
      default:
        return <SellerDashboard />;
    }
  };

  return (
    <div>
      <nav className="navbar">
        <div className="nav-container">
          <div className="logo">
            <span className="logo-icon-nav">📚</span>
            BookMeUp - Seller
          </div>
          <ul className="nav-links">
            <li>
              <a className={activePage === 'dashboard' ? 'active' : ''} onClick={() => setActivePage('dashboard')}>
                Dashboard
              </a>
            </li>
            <li>
              <a className={activePage === 'addBook' ? 'active' : ''} onClick={() => setActivePage('addBook')}>
                Add Book
              </a>
            </li>
            <li>
              <a className={activePage === 'myBooks' ? 'active' : ''} onClick={() => setActivePage('myBooks')}>
                My Books
              </a>
            </li>
            <li>
              <a className={activePage === 'orders' ? 'active' : ''} onClick={() => setActivePage('orders')}>
                Orders
              </a>
            </li>
            <li>
              <a className={activePage === 'earnings' ? 'active' : ''} onClick={() => setActivePage('earnings')}>
                Earnings
              </a>
            </li>
            <li>
              <a className={activePage === 'profile' ? 'active' : ''} onClick={() => setActivePage('profile')}>
                Profile
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
