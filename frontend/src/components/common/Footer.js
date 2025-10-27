import React from 'react';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <div className="footer-logo">
            <span className="logo-icon">🎯</span>
            <span className="logo-text">StudyMatch</span>
          </div>
          <p className="footer-description">
            Платформа для поиска партнеров для совместного обучения.
            Общайтесь, занимайтесь вместе и достигайте академических целей!
          </p>
          <div className="social-links">
            <a href="#" className="social-link" aria-label="ВКонтакте">
              <span className="social-icon">📘</span>
            </a>
            <a href="#" className="social-link" aria-label="Telegram">
              <span className="social-icon">📱</span>
            </a>
            <a href="#" className="social-link" aria-label="Instagram">
              <span className="social-icon">📷</span>
            </a>
          </div>
        </div>

        <div className="footer-section">
          <h4>Навигация</h4>
          <ul className="footer-links">
            <li><a href="/">Главная</a></li>
            <li><a href="/matching">Поиск партнеров</a></li>
            <li><a href="/chat">Чаты</a></li>
            <li><a href="/sessions">Учебные сессии</a></li>
            <li><a href="/profile">Профиль</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Помощь</h4>
          <ul className="footer-links">
            <li><a href="/about">О нас</a></li>
            <li><a href="/help">Помощь</a></li>
            <li><a href="/contact">Контакты</a></li>
            <li><a href="/faq">Частые вопросы</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Правовая информация</h4>
          <ul className="footer-links">
            <li><a href="/privacy">Конфиденциальность</a></li>
            <li><a href="/terms">Условия использования</a></li>
            <li><a href="/cookies">Cookie</a></li>
            <li><a href="/security">Безопасность</a></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-content">
          <div className="copyright">
            © {currentYear} StudyMatch. Все права защищены.
          </div>
          <div className="footer-bottom-links">
            <a href="/about">О нас</a>
            <span className="separator">•</span>
            <a href="/privacy">Конфиденциальность</a>
            <span className="separator">•</span>
            <a href="/contact">Контакты</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;