// src/context/AuthContext.js - ИСПРАВЛЕННАЯ ВЕРСИЯ
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
    console.log('🔐 Проверка аутентификации, токен:', token ? 'есть' : 'нет');

    if (token) {
      try {
        const response = await authAPI.getProfile();
        console.log('✅ Пользователь авторизован:', response.data);
        setUser(response.data);
      } catch (error) {
        console.error('❌ Ошибка проверки аутентификации:', error);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      }
    }
    setLoading(false);
  };

  const refreshUser = async () => {
    try {
      console.log('🔄 Обновление данных пользователя...');
      const response = await authAPI.getProfile();
      setUser(response.data);
      console.log('✅ Данные пользователя обновлены:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Ошибка обновления пользователя:', error);
      throw error;
    }
  };

  const login = async (credentials) => {
    try {
      setError('');
      console.log('🔐 Попытка входа...');
      const response = await authAPI.login(credentials);
      console.log('✅ Успешный вход:', response.data);

      const { access, refresh, user } = response.data;

      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      setUser(user);

      return response;
    } catch (error) {
      console.error('❌ Ошибка входа:', error);
      const message = error.response?.data?.error ||
                     error.response?.data?.detail ||
                     'Ошибка входа';
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
      const message = error.response?.data?.error ||
                     error.response?.data?.detail ||
                     'Ошибка регистрации';
      setError(message);
      throw error;
    }
  };

  const logout = () => {
    console.log('🚪 Выход из системы');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    setError('');
  };

  const updateUser = (userData) => {
    console.log('✏️ Обновление состояния пользователя:', userData);
    setUser(prevUser => ({ ...prevUser, ...userData }));
  };

  const clearError = () => {
    setError('');
  };

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