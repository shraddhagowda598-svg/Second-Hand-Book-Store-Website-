import React, { createContext, useContext, useEffect, useState } from 'react';
import * as authApi from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('bookmeup_token');
    if (!token) {
      setLoading(false);
      return;
    }
    authApi
      .getMe()
      .then((res) => setUser(res.user))
      .catch(() => {
        localStorage.removeItem('bookmeup_token');
      })
      .finally(() => setLoading(false));
  }, []);

  const loginWithToken = (token, userData) => {
    localStorage.setItem('bookmeup_token', token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('bookmeup_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, loginWithToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
