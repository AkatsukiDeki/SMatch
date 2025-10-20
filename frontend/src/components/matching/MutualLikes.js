// src/components/matching/MutualLikes.js
import React, { useState, useEffect } from 'react';
import { matchingAPI, chatAPI, studySessionsAPI } from '../../services/api'; // Добавлен studySessionsAPI
import './MutualLikes.css';

const MutualLikes = ({ onStartChat }) => {
  const [mutualLikes, setMutualLikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadMutualLikes = async () => {
    try {
      setLoading(true);
      const response = await matchingAPI.getMutualLikes();
      setMutualLikes(response.data);
    } catch (error) {
      setError('Ошибка загрузки взаимных лайков');
      console.error('Error loading mutual likes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendInvitation = async (user) => {
    try {
      // Создаем сессию
      const sessionData = {
        title: `Совместная сессия с ${user.first_name || user.username}`,
        description: `Приглашение на учебную сессию от ${user.first_name || user.username}`,
        subject_name: 'Совместное обучение',
        scheduled_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Завтра
        duration_minutes: 60,
        max_participants: 2
      };

      const sessionResponse = await studySessionsAPI.createSession(sessionData);
      const session = sessionResponse.data;

      // Отправляем приглашение
      await studySessionsAPI.sendInvitation(session.id, user.id);

      alert(`Приглашение отправлено пользователю ${user.first_name || user.username}!`);

    } catch (error) {
      console.error('Error sending invitation:', error);
      alert('Ошибка при отправке приглашения');
    }
  };

  const handleStartChat = async (user) => {
    try {
      // Создаем чат-комнату с пользователем
      const response = await chatAPI.createChatRoom(user.id);
      const chatRoom = response.data;

      // Переходим в чат
      if (onStartChat) {
        onStartChat(chatRoom);
      }
    } catch (error) {
      console.error('Error starting chat:', error);
      alert('Ошибка при создании чата');
    }
  };

  useEffect(() => {
    loadMutualLikes();
  }, []);

  if (loading) {
    return (
      <div className="mutual-likes-loading">
        <div className="spinner"></div>
        <p>Загрузка взаимных лайков...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mutual-likes-error">
        <p>{error}</p>
        <button onClick={loadMutualLikes}>Попробовать снова</button>
      </div>
    );
  }

  return (
    <div className="mutual-likes-container">
      <h3>Взаимные лайки 💕</h3>
      <p className="mutual-likes-subtitle">
        Эти пользователи тоже вас лайкнули! Начните общение или создайте учебную сессию.
      </p>

      {mutualLikes.length === 0 ? (
        <div className="no-mutual-likes">
          <p>Пока нет взаимных лайков</p>
          <small>Продолжайте свайпать, чтобы найти matches!</small>
        </div>
      ) : (
        <div className="mutual-likes-grid">
          {mutualLikes.map((item) => (
            <div key={item.swipe_id} className="mutual-like-card">
              <div className="mutual-like-header">
                <div className="mutual-like-avatar">
                  {item.user.first_name?.charAt(0) || item.user.username?.charAt(0) || 'U'}
                </div>
                <div className="mutual-like-info">
                  <h4>
                    {item.user.first_name && item.user.last_name
                      ? `${item.user.first_name} ${item.user.last_name}`
                      : item.user.username
                    }
                  </h4>
                  <p className="mutual-like-username">@{item.user.username}</p>
                  <p className="mutual-like-faculty">{item.user.faculty}</p>
                </div>
              </div>

              <div className="mutual-like-actions">
                <button
                  className="btn-chat"
                  onClick={() => handleStartChat(item.user)}
                >
                  💬 Начать чат
                </button>
                <button
                  className="btn-invite"
                  onClick={() => handleSendInvitation(item.user)}
                >
                  📨 Пригласить на сессию
                </button>
              </div>

              <div className="mutual-like-meta">
                <span>Совпадение: {new Date(item.matched_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MutualLikes;