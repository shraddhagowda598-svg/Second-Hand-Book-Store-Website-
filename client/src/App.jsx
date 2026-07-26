import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import LoginView from './pages/LoginView.jsx';
import RegisterView from './pages/RegisterView.jsx';
import VerifyOtpView from './pages/VerifyOtpView.jsx';
import BuyerPanel from './pages/buyer/BuyerPanel.jsx';
import SellerPanel from './pages/seller/SellerPanel.jsx';
import AdminPanel from './pages/admin/AdminPanel.jsx';

function AppInner() {
  const { user, loading, logout } = useAuth();
  // 'login' | 'register' | 'verifyOtp'
  const [authView, setAuthView] = useState('login');
  const [pendingVerification, setPendingVerification] = useState(null); // { userId, email }

  if (loading) {
    return (
      <div className="auth-container">
        <div style={{ color: 'white', fontSize: '18px' }}>Loading BookMeUp...</div>
      </div>
    );
  }

  if (!user) {
    if (authView === 'register') {
      return (
        <RegisterView
          onSwitchView={() => setAuthView('login')}
          onRegistered={({ userId, email }) => {
            setPendingVerification({ userId, email });
            setAuthView('verifyOtp');
          }}
        />
      );
    }
    if (authView === 'verifyOtp' && pendingVerification) {
      return (
        <VerifyOtpView
          userId={pendingVerification.userId}
          email={pendingVerification.email}
          onVerified={() => setAuthView('login')}
          onBackToLogin={() => setAuthView('login')}
        />
      );
    }
    return <LoginView onSwitchView={() => setAuthView('register')} />;
  }

  const renderPanel = () => {
    switch (user.role) {
      case 'seller':
        return <SellerPanel onLogout={logout} />;
      case 'admin':
        return <AdminPanel onLogout={logout} />;
      default:
        return <BuyerPanel onLogout={logout} />;
    }
  };

  return <div className="app">{renderPanel()}</div>;
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
