import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { studySessionsAPI } from '../../services/api';
import './Header.css';

const Header = () => {
  const { user, logout } = useAuth();
  const [pendingInvitations, setPendingInvitations] = useState(0);
  const location = useLocation();

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

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          <span className="logo-icon">🎯</span>
          <span className="logo-text">StudyMatch</span>
        </Link>

        <nav className="nav">
          {user ? (
            <>
              <Link to="/matching" className={`nav-link ${isActive('/matching')}`}>
                <span className="nav-icon">🔍</span>
                Поиск
              </Link>
              <Link to="/chat" className={`nav-link ${isActive('/chat')}`}>
                <span className="nav-icon">💬</span>
                Чат
                {pendingInvitations > 0 && (
                  <span className="notification-badge">{pendingInvitations}</span>
                )}
              </Link>
              <Link to="/sessions" className={`nav-link ${isActive('/sessions')}`}>
                <span className="nav-icon">📚</span>
                Сессии
              </Link>
              <Link to="/profile" className={`nav-link ${isActive('/profile')}`}>
                <span className="nav-icon">👤</span>
                Профиль
              </Link>
              <button onClick={logout} className="logout-btn">
                <span className="nav-icon">🚪</span>
                Выйти
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={`nav-link ${isActive('/login')}`}>
                Войти
              </Link>
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