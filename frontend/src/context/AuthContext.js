import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const response = await authAPI.getProfile();
        setUser(response.data);
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      }
    }
    setLoading(false);
  };

  const login = async (credentials) => {
    try {
      setError('');
      const response = await authAPI.login(credentials);
      const { access, refresh, user } = response.data;

      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      setUser(user);

      return response;
    } catch (error) {
      const message = error.response?.data?.error || 'Ошибка входа';
      setError(message);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      setError('');
      const response = await authAPI.register(userData);
      const { access, refresh, user } = response.data;

      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      setUser(user);

      return response;
    } catch (error) {
      const message = error.response?.data?.error || 'Ошибка регистрации';
      setError(message);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    setError('');
  };

  const updateUser = (userData) => {
    setUser(prevUser => ({ ...prevUser, ...userData }));
  };

  const refreshUser = async () => {
    try {
      const response = await authAPI.getProfile();
      const updatedUser = response.data;
      setUser(updatedUser);
      return updatedUser;
    } catch (error) {
      console.error('Error refreshing user:', error);
      throw error;
    }
  };

  const clearError = () => setError('');

  const value = {
    user,
    login,
    register,
    logout,
    updateUser,
    refreshUser,
    loading,
    error,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};