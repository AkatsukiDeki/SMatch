import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { matchingAPI } from '../services/api';
import UserCard from '../components/matching/UserCard';
import Filters from '../components/matching/Filters';
import './Matching.css';
import MutualLikes from '../components/matching/MutualLikes';
import { useNavigate } from 'react-router-dom';

const Matching = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    faculty: '',
    year: '',
    subject_id: ''
  });
  const [swipeAnimation, setSwipeAnimation] = useState(null);

  useEffect(() => {
    loadSubjects();
    loadRecommendations();
  }, [filters]);

  const loadSubjects = async () => {
    try {
      const response = await matchingAPI.getSubjects();
      setSubjects(response.data);
    } catch (error) {
      console.error('Error loading subjects:', error);
    }
  };

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      const response = await matchingAPI.getRecommendations(filters);
      setRecommendations(response.data);
      setCurrentIndex(0);
    } catch (error) {
      setError('Ошибка загрузки рекомендаций');
      console.error('Error loading recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartChat = (chatRoom) => {
    navigate('/chat', { state: { selectedChat: chatRoom } });
  };

  const handleFilterChange = (e) => {
    if (e.target.name === 'reset') {
      setFilters({
        faculty: '',
        year: '',
        subject_id: ''
      });
    } else {
      setFilters(prev => ({
        ...prev,
        [e.target.name]: e.target.value
      }));
    }
  };

  const handleSwipe = async (userId, action) => {
    try {
      await matchingAPI.swipe(userId, action);
      setSwipeAnimation({ userId, action });

      setRecommendations(prev => prev.filter(user => user.id !== userId));
      setCurrentIndex(prev => Math.min(prev, recommendations.length - 2));
      setSwipeAnimation(null);

      if (recommendations.length <= 1) {
        loadRecommendations();
        setCurrentIndex(0);
      }
    } catch (error) {
      console.error('Error swiping:', error);
      setError('Ошибка при отправке действия');
      setSwipeAnimation(null);
    }
  };

  // Проверка аутентификации
  if (!user) {
    return (
      <div className="matching-page">
        <div className="auth-required">
          <h2>Для поиска партнеров необходимо войти в систему</h2>
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

      <Filters
        filters={filters}
        onFilterChange={handleFilterChange}
        subjects={subjects}
      />

      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          <p>Поиск подходящих партнеров...</p>
        </div>
      ) : error ? (
        <div className="error-message">
          <h3>{error}</h3>
          <button onClick={loadRecommendations}>Попробовать снова</button>
        </div>
      ) : (
        <div className="matching-container">
          {recommendations.length === 0 ? (
            <div className="no-users">
              <h2>Пока нет рекомендаций</h2>
              <p>Попробуйте изменить фильтры или добавить больше предметов в ваш профиль</p>
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
                <button
                  className="btn-pass"
                  onClick={() => handleSwipe(recommendations[currentIndex]?.id, 'pass')}
                >
                  ✕ Пропустить
                </button>
                <button
                  className="btn-like"
                  onClick={() => handleSwipe(recommendations[currentIndex]?.id, 'like')}
                >
                  ❤️ Лайк
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Добавляем блок взаимных лайков */}
      <MutualLikes onStartChat={handleStartChat} />
    </div>
  );
};

export default Matching;