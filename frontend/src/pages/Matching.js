// src/pages/Matching.js - ИСПРАВЛЕННАЯ ВЕРСИЯ
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { matchingAPI } from '../services/api';
import UserCard from '../components/matching/UserCard';
import Filters from '../components/matching/Filters';
import MutualLikes from '../components/matching/MutualLikes';
import { useNavigate } from 'react-router-dom';
import './Matching.css';

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
      console.log('📚 Загрузка предметов...');
      const response = await matchingAPI.getSubjects();
      console.log('✅ Предметы загружены:', response.data);
      setSubjects(response.data);
    } catch (error) {
      console.error('❌ Ошибка загрузки предметов:', error);
    }
  };

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('🔍 Загрузка рекомендаций с фильтрами:', filters);

      const response = await matchingAPI.getRecommendations(filters);
      console.log('✅ Рекомендации загружены:', response.data);
      setRecommendations(response.data);

    } catch (error) {
      console.error('❌ Ошибка загрузки рекомендаций:', error);

      // Fallback на тестовые данные
      try {
        console.log('🔄 Пробуем загрузить тестовые рекомендации...');
        const testResponse = await matchingAPI.getTestRecommendations();
        setRecommendations(testResponse.data);
        setError('Используются тестовые данные');
      } catch (testError) {
        setError('Не удалось загрузить рекомендации');
        setRecommendations([]);
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
      console.log(`🔄 Свайп: ${action} пользователя ${userId}`);
      await matchingAPI.swipe(userId, action);

      // Убираем пользователя из списка
      setRecommendations(prev => prev.filter(user => user.id !== userId));

      console.log(`✅ ${action === 'like' ? 'Лайк' : 'Пас'} отправлен`);

    } catch (error) {
      console.error('❌ Ошибка при отправке свайпа:', error);
      setError('Ошибка при отправке действия');
    }
  };

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
        <h1>🎯 Найди идеального партнера для обучения</h1>
        <p>Свайпай вправо 👍 чтобы лайкнуть, влево 👎 чтобы пропустить</p>
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
          <p>Ищем подходящих партнеров...</p>
        </div>
      ) : (
        <div className="matching-container">
          {recommendations.length === 0 ? (
            <div className="no-users">
              <div className="no-users-icon">🔍</div>
              <h2>Пока нет рекомендаций</h2>
              <p>Попробуйте изменить фильтры или добавить больше предметов в профиль</p>
              <div className="no-users-actions">
                <button onClick={loadRecommendations}>Обновить</button>
                <button onClick={() => navigate('/profile')}>Добавить предметы</button>
              </div>
            </div>
          ) : (
            <div className="cards-stack">
              {recommendations.slice(0, 3).map((user, index) => (
                <UserCard
                  key={user.id}
                  user={user}
                  onSwipe={handleSwipe}
                  currentIndex={index}
                  totalCards={recommendations.length}
                  style={{
                    zIndex: recommendations.length - index,
                    transform: `scale(${1 - index * 0.08}) translateY(${index * 15}px)`,
                    opacity: 1 - index * 0.2
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <MutualLikes onStartChat={handleStartChat} />
    </div>
  );
};

export default Matching;