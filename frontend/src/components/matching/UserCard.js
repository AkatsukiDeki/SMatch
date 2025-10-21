// src/components/matching/UserCard.js - ОБНОВЛЕННАЯ ВЕРСИЯ
import React, { useState } from 'react';
import './UserCard.css';

const UserCard = ({ user, onSwipe, currentIndex, totalCards, style }) => {
  const [isSwiping, setIsSwiping] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState(null);

  const handleSwipe = (action) => {
    setIsSwiping(true);
    setSwipeDirection(action);

    setTimeout(() => {
      if (onSwipe) {
        onSwipe(user.id, action);
      }
      setIsSwiping(false);
      setSwipeDirection(null);
    }, 500);
  };

  const handleLike = () => handleSwipe('like');
  const handlePass = () => handleSwipe('pass');

  const getInitials = (firstName, lastName, username) => {
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }
    return username ? username.charAt(0).toUpperCase() : 'U';
  };

  const getStudyLevel = (yearOfStudy) => {
    if (!yearOfStudy) return "Не указано";
    if (yearOfStudy === 1) return "Начинающий";
    if (yearOfStudy === 2) return "Развивающийся";
    if (yearOfStudy >= 3) return "Продвинутый";
    return "Не указано";
  };

  // Ограничиваем длину текста
  const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Ограничиваем количество предметов
  const displaySubjects = user.subjects ? user.subjects.slice(0, 4) : [];

  return (
    <div
      className={`user-card ${isSwiping ? `swipe-${swipeDirection}` : ''}`}
      style={style}
    >
      <div className="card-header">
        <span className="card-counter">
          {currentIndex + 1} / {totalCards}
        </span>
      </div>

      <div className="card-content">
        <div className="user-image">
          <div className="avatar-placeholder">
            {getInitials(user.first_name, user.last_name, user.username)}
          </div>
        </div>

        <div className="user-info">
          <div className="user-name">
            {user.first_name && user.last_name
              ? `${user.first_name} ${user.last_name}`
              : user.username
            }
          </div>

          <div className="user-meta">
            <div className="meta-item">
              <span className="meta-label">Факультет:</span>
              <span className="meta-value">
                {truncateText(user.faculty, 20) || 'Не указан'}
              </span>
            </div>

            <div className="meta-item">
              <span className="meta-label">Курс:</span>
              <span className="meta-value">
                {user.year_of_study ? `${user.year_of_study} курс` : 'Не указан'}
              </span>
            </div>

            <div className="meta-item">
              <span className="meta-label">Уровень:</span>
              <span className="meta-value">
                {getStudyLevel(user.year_of_study)}
              </span>
            </div>
          </div>

          {user.bio && (
            <div className="user-bio">
              <h4>О себе:</h4>
              <p>{truncateText(user.bio, 120)}</p>
            </div>
          )}

          {displaySubjects.length > 0 && (
            <div className="user-subjects">
              <h4>Предметы:</h4>
              <div className="subjects-list">
                {displaySubjects.map((subject, index) => (
                  <span key={index} className="subject-tag">
                    {truncateText(subject.name, 15)} ({subject.level})
                  </span>
                ))}
                {user.subjects && user.subjects.length > 4 && (
                  <span className="subject-tag more">
                    +{user.subjects.length - 4} ещё
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="swipe-indicators">
            <div className={`indicator left ${swipeDirection === 'pass' ? 'active' : ''}`}>
              👎 Пропустить
            </div>
            <div className={`indicator right ${swipeDirection === 'like' ? 'active' : ''}`}>
              👍 Лайк
            </div>
          </div>
        </div>
      </div>

      <div className="card-actions">
        <button
          className="btn-pass"
          onClick={handlePass}
          disabled={isSwiping}
        >
          👎 Пропустить
        </button>
        <button
          className="btn-like"
          onClick={handleLike}
          disabled={isSwiping}
        >
          👍 Лайк
        </button>
      </div>
    </div>
  );
};

export default UserCard;