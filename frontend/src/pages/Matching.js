// src/pages/Matching.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { matchingAPI } from '../services/api';
import UserCard from '../components/matching/UserCard';
import './Matching.css';

const Matching = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      const response = await matchingAPI.getRecommendations();
      setRecommendations(response.data);
    } catch (error) {
      setError('Ошибка загрузки рекомендаций');
      console.error('Error loading recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = async (userId, action) => {
    try {
      await matchingAPI.swipe(userId, action);

      // Удаляем свайпнутого пользователя из списка
      setRecommendations(prev => prev.filter(user => user.id !== userId));
      setCurrentIndex(prev => Math.min(prev, recommendations.length - 2));

      // Если список пуст, загружаем новые рекомендации
      if (recommendations.length <= 1) {
        loadRecommendations();
        setCurrentIndex(0);
      }
    } catch (error) {
      console.error('Error swiping:', error);
      setError('Ошибка при отправке действия');
    }
  };

  const handleLike = () => {
    if (recommendations[currentIndex]) {
      handleSwipe(recommendations[currentIndex].id, 'like');
    }
  };

  const handlePass = () => {
    if (recommendations[currentIndex]) {
      handleSwipe(recommendations[currentIndex].id, 'pass');
    }
  };

  if (!user) {
    return (
      <div className="matching-page">
        <div className="auth-required">
          <h2>Для поиска партнеров необходимо войти в систему</h2>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="matching-page">
        <div className="loading">
          <h2>Поиск подходящих партнеров...</h2>
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="matching-page">
        <div className="error-message">
          <h3>{error}</h3>
          <button onClick={loadRecommendations}>Попробовать снова</button>
        </div>
      </div>
    );
  }

  return (
    <div className="matching-page">
      <div className="matching-header">
        <h1>Найди партнера для обучения</h1>
        <p>Свайпай вправо чтобы лайкнуть, влево чтобы пропустить</p>
      </div>

      <div className="matching-container">
        {recommendations.length === 0 ? (
          <div className="no-users">
            <h2>Пока нет рекомендаций</h2>
            <p>Попробуйте добавить больше предметов в ваш профиль</p>
            <button onClick={loadRecommendations}>Обновить</button>
          </div>
        ) : (
          <>
            <div className="cards-container">
              {recommendations.slice(0, 3).map((user, index) => (
                <UserCard
                  key={user.id}
                  user={user}
                  onSwipe={handleSwipe}
                  currentIndex={index}
                  totalCards={recommendations.length}
                  style={{
                    zIndex: 3 - index,
                    transform: `scale(${1 - index * 0.1}) translateY(${index * 10}px)`
                  }}
                />
              ))}
            </div>

            <div className="swipe-buttons">
              <button className="btn-pass" onClick={handlePass}>
                ✕ Пропустить
              </button>
              <button className="btn-like" onClick={handleLike}>
                ❤️ Лайк
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Matching;