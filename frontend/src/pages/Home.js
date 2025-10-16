// src/pages/Home.js
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="home-page">
      <section className="hero">
        <h1>Добро пожаловать в StudyMatch</h1>
        <p>Найди идеального партнера для совместного обучения</p>

        {user ? (
          <div className="user-welcome">
            <h2>Привет, {user.username}!</h2>
            <div className="action-buttons">
              <Link to="/matching" className="btn primary">
                Начать поиск
              </Link>
              <Link to="/profile" className="btn secondary">
                Мой профиль
              </Link>
            </div>
          </div>
        ) : (
          <div className="guest-actions">
            <Link to="/register" className="btn primary">
              Начать сейчас
            </Link>
            <Link to="/login" className="btn secondary">
              Уже есть аккаунт
            </Link>
          </div>
        )}
      </section>

      <section className="features">
        <div className="feature">
          <h3>🔍 Умный подбор</h3>
          <p>Находи студентов с похожими интересами и целями</p>
        </div>
        <div className="feature">
          <h3>💬 Общение</h3>
          <p>Удобный чат для обсуждения учебных вопросов</p>
        </div>
        <div className="feature">
          <h3>📚 Совместные сессии</h3>
          <p>Организуйте учебные встречи и делитесь знаниями</p>
        </div>
      </section>
    </div>
  );
};

export default Home;