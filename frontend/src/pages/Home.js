import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Home.css';

const Home = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="home-page">
        <div className="loading">
          <div className="spinner"></div>
          <p>Проверка авторизации...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-content">
          <h1>Добро пожаловать в StudyMatch</h1>
          <p>Найдите идеального партнера для совместного обучения</p>

          {user ? (
            <div className="user-welcome">
              <h2>Привет, {user.first_name || user.username}!</h2>
              <p>Рады снова видеть вас! Что хотите сделать?</p>
              <div className="action-buttons">
                <Link to="/matching" className="btn btn-primary">
                  <span className="btn-icon">🔍</span>
                  Найти партнеров
                </Link>
                <Link to="/chat" className="btn btn-secondary">
                  <span className="btn-icon">💬</span>
                  Перейти в чат
                </Link>
                <Link to="/sessions" className="btn btn-accent">
                  <span className="btn-icon">📚</span>
                  Учебные сессии
                </Link>
                <Link to="/profile" className="btn btn-outline">
                  <span className="btn-icon">👤</span>
                  Мой профиль
                </Link>
              </div>
            </div>
          ) : (
            <div className="guest-actions">
              <p>Присоединяйтесь к сообществу студентов для совместного обучения</p>
              <div className="action-buttons">
                <Link to="/register" className="btn btn-primary">
                  <span className="btn-icon">🚀</span>
                  Начать сейчас
                </Link>
                <Link to="/login" className="btn btn-secondary">
                  <span className="btn-icon">🔑</span>
                  Уже есть аккаунт
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="features">
        <div className="feature-card">
          <div className="feature-icon">🎯</div>
          <h3>Умный подбор</h3>
          <p>Алгоритмы находят студентов с похожими интересами и целями обучения</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">💬</div>
          <h3>Общение в реальном времени</h3>
          <p>Удобный чат для обсуждения учебных вопросов и материалов</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">📅</div>
          <h3>Совместные сессии</h3>
          <p>Организуйте учебные встречи и делитесь знаниями с партнерами</p>
        </div>
      </section>
    </div>
  );
};

export default Home;