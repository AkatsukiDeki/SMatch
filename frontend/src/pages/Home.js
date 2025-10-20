import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Home.css';

const Home = () => {
  const { user, loading } = useAuth();

  // Показываем загрузку пока проверяется аутентификация
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

  console.log('Home component - User:', user);
  console.log('Home component - Loading:', loading);

  return (
    <div className="home-page">
      <section className="hero">
        <h1>Добро пожаловать в StudyMatch</h1>
        <p>Найдите идеального партнера для совместного обучения</p>

        {user ? (
          <div className="user-welcome">
            <h2>Привет, {user.username}!</h2>
            <p>Рады снова видеть вас!</p>
            <div className="action-buttons">
              <Link to="/matching" className="btn btn-primary">
                🔍 Найти партнеров
              </Link>
              <Link to="/chat" className="btn btn-secondary">
                💬 Перейти в чат
              </Link>
              <Link to="/profile" className="btn btn-outline">
                👤 Мой профиль
              </Link>
            </div>
          </div>
        ) : (
          <div className="guest-actions">
            <p>Присоединяйтесь к сообществу студентов для совместного обучения</p>
            <div className="action-buttons">
              <Link to="/register" className="btn btn-primary">
                🚀 Начать сейчас
              </Link>
              <Link to="/login" className="btn btn-secondary">
                🔑 Уже есть аккаунт
              </Link>
            </div>
          </div>
        )}
      </section>

      <section className="features">
        <div className="feature">
          <div className="feature-icon">🔍</div>
          <h3>Умный подбор</h3>
          <p>Находите студентов с похожими интересами и целями обучения</p>
        </div>
        <div className="feature">
          <div className="feature-icon">💬</div>
          <h3>Общение</h3>
          <p>Удобный чат для обсуждения учебных вопросов и материалов</p>
        </div>
        <div className="feature">
          <div className="feature-icon">📚</div>
          <h3>Совместные сессии</h3>
          <p>Организуйте учебные встречи и делитесь знаниями с партнерами</p>
        </div>
      </section>

      {/* Добавляем отладочную информацию (можно убрать после тестирования) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="debug-info" style={{marginTop: '2rem', padding: '1rem', background: '#f5f5f5', borderRadius: '8px'}}>
          <h4>Отладочная информация:</h4>
          <p><strong>Пользователь:</strong> {user ? JSON.stringify(user) : 'не авторизован'}</p>
          <p><strong>Токен в localStorage:</strong> {localStorage.getItem('access_token') ? 'есть' : 'нет'}</p>
        </div>
      )}
    </div>
  );
};

export default Home;