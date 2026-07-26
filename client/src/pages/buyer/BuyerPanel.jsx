import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import * as cartApi from '../../api/cart';
import BuyerHome from './BuyerHome.jsx';
import BuyerCategories from './BuyerCategories.jsx';
import BuyerCart from './BuyerCart.jsx';
import BuyerOrders from './BuyerOrders.jsx';
import BuyerProfile from './BuyerProfile.jsx';

export default function BuyerPanel({ onLogout }) {
  const { user } = useAuth();
  const [activePage, setActivePage] = useState('home');
  const [cart, setCart] = useState({ items: [] });
  const [searchQuery, setSearchQuery] = useState('');

  const refreshCart = useCallback(() => {
    cartApi
      .getCart()
      .then((res) => setCart(res.cart))
      .catch(() => {});
  }, []);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addToCart = async (bookId) => {
    const res = await cartApi.addToCart(bookId, 1);
    setCart(res.cart);
    setActivePage('cart');
  };

  const removeFromCart = async (bookId) => {
    const res = await cartApi.removeFromCart(bookId);
    setCart(res.cart);
  };

  const updateQuantity = async (bookId, newQuantity) => {
    if (newQuantity < 1) {
      await removeFromCart(bookId);
      return;
    }
    const res = await cartApi.updateCartItem(bookId, newQuantity);
    setCart(res.cart);
  };

  const cartTotal = (cart.items || []).reduce((total, item) => {
    if (!item.book) return total;
    return total + item.book.finalPrice * item.quantity;
  }, 0);

  const cartCount = (cart.items || []).length;

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.trim()) setActivePage('home');
  };

  const renderPage = () => {
    switch (activePage) {
      case 'home':
        return <BuyerHome addToCart={addToCart} searchQuery={searchQuery} />;
      case 'categories':
        return <BuyerCategories addToCart={addToCart} />;
      case 'cart':
        return (
          <BuyerCart
            cart={cart}
            removeFromCart={removeFromCart}
            updateQuantity={updateQuantity}
            cartTotal={cartTotal}
            onOrderPlaced={() => {
              refreshCart();
              setActivePage('orders');
            }}
          />
        );
      case 'orders':
        return <BuyerOrders />;
      case 'profile':
        return <BuyerProfile user={user} />;
      default:
        return <BuyerHome addToCart={addToCart} searchQuery={searchQuery} />;
    }
  };

  return (
    <div>
      <nav className="navbar">
        <div className="nav-container">
          <div className="logo">
            <span className="logo-icon-nav">📚</span>
            BookMeUp
          </div>
          <ul className="nav-links">
            <li>
              <a className={activePage === 'home' ? 'active' : ''} onClick={() => setActivePage('home')}>
                Home
              </a>
            </li>
            <li>
              <a
                className={activePage === 'categories' ? 'active' : ''}
                onClick={() => setActivePage('categories')}
              >
                Categories
              </a>
            </li>
            <li>
              <a className={activePage === 'cart' ? 'active' : ''} onClick={() => setActivePage('cart')}>
                Cart {cartCount > 0 ? `(${cartCount})` : ''}
              </a>
            </li>
            <li>
              <a className={activePage === 'orders' ? 'active' : ''} onClick={() => setActivePage('orders')}>
                Orders
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
          <div className="search-container">
            <input
              type="text"
              className="search-input"
              placeholder="Search books..."
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
        </div>
      </nav>

      <div className="panel">
        <div className="container">{renderPage()}</div>
      </div>
    </div>
  );
}
