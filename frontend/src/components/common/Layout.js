// src/components/common/Layout.js
import React from 'react';
import Header from './Header';
import './Layout.css';

const Layout = ({ children, className = '' }) => {
  return (
    <div className="app">
      <Header />
      <main className={`main-content ${className}`}>
        {children}
      </main>
      <Footer />
    </div>
  );
};

// Простой футер для завершения композиции
const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p>&copy; 2024 StudyMatch. Все права защищены.</p>
        <div className="footer-links">
          <a href="/about">О нас</a>
          <a href="/privacy">Конфиденциальность</a>
          <a href="/contact">Контакты</a>
        </div>
      </div>
    </footer>
  );
};

export default Layout;