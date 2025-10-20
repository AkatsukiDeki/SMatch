// src/pages/Matching.js - ИСПРАВЛЕННАЯ ВЕРСИЯ
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    faculty: '',
    year: '',
    subject_id: ''
  });

  useEffect(() => {
    loadSubjects();
  }, []);

  useEffect(() => {
    if (user) {
      loadRecommendations();
    }
  }, [filters, user]);

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
      setError('');
      const response = await matchingAPI.getRecommendations(filters);
      setRecommendations(response.data);
    } catch (error) {
      console.error('Error loading recommendations:', error);
      setError('Ошибка загрузки рекомендаций');
      // Показываем тестовые данные при ошибке
      try {
        const testResponse = await matchingAPI.getTestRecommendations();
        setRecommendations(testResponse.data);
      } catch (testError) {
        setError('Не удалось загрузить рекомендации');
      }
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

      // Удаляем пользователя из списка рекомендаций
      setRecommendations(prev => prev.filter(user => user.id !== userId));

    } catch (error) {
      console.error('Error swiping:', error);
      setError('Ошибка при отправке действия');
    }
  };

  // Проверка аутентификации
  if (!user) {
    return (
      <div className="matching-page">
        <div className="auth-required">
          <h2>Для поиска партнеров необходимо войти в систему</h2>
          <button onClick={() => navigate('/login')} className="login-btn">
            Войти
          </button>
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

      {error && (
        <div className="error-message">
          {error}
          <button onClick={loadRecommendations} style={{marginLeft: '10px'}}>
            Попробовать снова
          </button>
        </div>
      )}

      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          <p>Поиск подходящих партнеров...</p>
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
            <div className="cards-stack">
              {/* Показываем только первые 3 карточки в стеке */}
              {recommendations.slice(0, 3).map((user, index) => (
                <UserCard
                  key={user.id}
                  user={user}
                  onSwipe={handleSwipe}
                  currentIndex={index}
                  totalCards={recommendations.length}
                  style={{
                    zIndex: 3 - index, // Первая карточка поверх остальных
                    transform: `scale(${1 - index * 0.08}) translateY(${index * 15}px)`,
                    opacity: 1 - index * 0.2
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Добавляем блок взаимных лайков */}
      <MutualLikes onStartChat={handleStartChat} />
    </div>
  );
};

export default Matching;