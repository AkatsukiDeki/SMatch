// src/components/common/Header.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { studySessionsAPI } from '../../services/api';
import './Header.css';

const Header = () => {
  const { user, logout } = useAuth();
  const [pendingInvitations, setPendingInvitations] = useState(0);

  useEffect(() => {
    if (user) {
      loadPendingInvitations();
    }
  }, [user]);

  const loadPendingInvitations = async () => {
    try {
      const response = await studySessionsAPI.getInvitations();
      const pending = response.data.filter(inv => inv.status === 'pending').length;
      setPendingInvitations(pending);
    } catch (error) {
      console.error('Error loading invitations:', error);
    }
  };

  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="logo">
          StudyMatch
        </Link>

        <nav className="nav">
          {user ? (
            <>
              <Link to="/matching" className="nav-link">🔍 Поиск</Link>
              <Link to="/chat" className="nav-link">💬 Чат</Link>
              <Link to="/sessions" className="nav-link">
                📚 Сессии
                {pendingInvitations > 0 && (
                  <span className="notification-badge">{pendingInvitations}</span>
                )}
              </Link>
              <Link to="/profile" className="nav-link">👤 Профиль</Link>
              <button onClick={logout} className="logout-btn">
                Выйти
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Войти</Link>
              <Link to="/register" className="nav-link register-btn">
                Регистрация
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;