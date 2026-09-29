import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('elephant_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('elephant_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('elephant_token');
      if (storedToken) {
        try {
          const currentUser = await authApi.getCurrentUser();
          setUser(currentUser);
          localStorage.setItem('elephant_user', JSON.stringify(currentUser));
        } catch (err) {
          console.error('Session expired or invalid token:', err);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const data = await authApi.login({ email, password });
    const { token: jwtToken, ...userInfo } = data;

    setToken(jwtToken);
    setUser(userInfo);
    localStorage.setItem('elephant_token', jwtToken);
    localStorage.setItem('elephant_user', JSON.stringify(userInfo));
    return userInfo;
  };

  const register = async (userData) => {
    return await authApi.register(userData);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('elephant_token');
    localStorage.removeItem('elephant_user');
  };

  const updateUser = (updatedInfo) => {
    setUser((prev) => {
      const merged = { ...prev, ...updatedInfo };
      localStorage.setItem('elephant_user', JSON.stringify(merged));
      return merged;
    });
  };

  const refreshUser = async () => {
    try {
      const currentUser = await authApi.getCurrentUser();
      setUser(currentUser);
      localStorage.setItem('elephant_user', JSON.stringify(currentUser));
    } catch (e) {
      console.error('Could not refresh user profile:', e);
    }
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    isAdmin: user?.role === 'ADMIN',
    login,
    register,
    logout,
    updateUser,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
