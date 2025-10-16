// src/components/matching/UserCard.js
import React from 'react';
import './UserCard.css';

const UserCard = ({ user, onSwipe, currentIndex, totalCards }) => {
  if (!user) return null;

  const handleSwipe = (action) => {
    onSwipe(user.id, action);
  };

  return (
    <div className="user-card">
      <div className="card-header">
        <span className="card-counter">{currentIndex + 1} / {totalCards}</span>
      </div>

      <div className="user-image">
        <div className="avatar-placeholder">
          {user.username?.charAt(0).toUpperCase() || 'U'}
        </div>
      </div>

      <div className="user-info">
        <h2 className="user-name">
          {user.first_name && user.last_name
            ? `${user.first_name} ${user.last_name}`
            : user.username
          }
        </h2>

        <div className="user-meta">
          <div className="meta-item">
            <span className="meta-label">Факультет:</span>
            <span className="meta-value">{user.faculty || 'Не указан'}</span>
          </div>

          <div className="meta-item">
            <span className="meta-label">Курс:</span>
            <span className="meta-value">{user.year_of_study || 'Не указан'}</span>
          </div>

          <div className="meta-item">
            <span className="meta-label">Уровень:</span>
            <span className="meta-value">{user.study_level || 'Не указан'}</span>
          </div>
        </div>

        {user.bio && (
          <div className="user-bio">
            <h4>О себе:</h4>
            <p>{user.bio}</p>
          </div>
        )}

        <div className="user-subjects">
          <h4>Интересы:</h4>
          <div className="subjects-list">
            {/* Здесь будут предметы пользователя */}
            <span className="subject-tag">Программирование</span>
            <span className="subject-tag">Математика</span>
            <span className="subject-tag">Физика</span>
          </div>
        </div>
      </div>

      <div className="card-actions">
        <button
          className="btn-pass"
          onClick={() => handleSwipe('pass')}
        >
          ✕ Пропустить
        </button>
        <button
          className="btn-like"
          onClick={() => handleSwipe('like')}
        >
          ❤️ Лайк
        </button>
      </div>
    </div>
  );
};

export default UserCard;