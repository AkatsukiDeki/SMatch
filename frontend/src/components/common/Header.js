// src/components/common/Header.js
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Header.css';

const Header = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo-link" onClick={closeMobileMenu}>
          <span className="logo-icon">📚</span>
          <span className="logo-text">StudyMatch</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="nav-desktop">
          {user ? (
            <>
              <Link
                to="/matching"
                className={`nav-link ${isActive('/matching') ? 'active' : ''}`}
              >
                🔍 Поиск
              </Link>
              <Link
                to="/chat"
                className={`nav-link ${isActive('/chat') ? 'active' : ''}`}
              >
                💬 Чаты
              </Link>
              <Link
                to="/sessions"
                className={`nav-link ${isActive('/sessions') ? 'active' : ''}`}
              >
                📚 Сессии
              </Link>
              <Link
                to="/profile"
                className={`nav-link ${isActive('/profile') ? 'active' : ''}`}
              >
                👤 Профиль
              </Link>
              <button onClick={handleLogout} className="logout-btn">
                Выйти
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className={`nav-link ${isActive('/login') ? 'active' : ''}`}
              >
                Войти
              </Link>
              <Link
                to="/register"
                className="nav-link register"
              >
                Регистрация
              </Link>
            </>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="mobile-menu-btn"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          ☰
        </button>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <nav className="nav-mobile">
            {user ? (
              <>
                <Link
                  to="/matching"
                  className="nav-link"
                  onClick={closeMobileMenu}
                >
                  🔍 Поиск партнера
                </Link>
                <Link
                  to="/chat"
                  className="nav-link"
                  onClick={closeMobileMenu}
                >
                  💬 Мои чаты
                </Link>
                <Link
                  to="/sessions"
                  className="nav-link"
                  onClick={closeMobileMenu}
                >
                  📚 Учебные сессии
                </Link>
                <Link
                  to="/profile"
                  className="nav-link"
                  onClick={closeMobileMenu}
                >
                  👤 Мой профиль
                </Link>
                <button
                  onClick={handleLogout}
                  className="logout-btn mobile"
                >
                  🚪 Выйти
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="nav-link"
                  onClick={closeMobileMenu}
                >
                  Войти в аккаунт
                </Link>
                <Link
                  to="/register"
                  className="nav-link"
                  onClick={closeMobileMenu}
                >
                  Создать аккаунт
                </Link>
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;