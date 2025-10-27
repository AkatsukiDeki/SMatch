import React from 'react';
import Header from './Header';
import Footer from './Footer'; // Импортируем новый футер
import './Layout.css';

const Layout = ({ children, className = '' }) => {
  return (
    <div className="app">
      <Header />
      <main className={`main-content ${className}`}>
        {children}
      </main>
      <Footer /> {/* Используем новый футер */}
    </div>
  );
};

export default Layout;