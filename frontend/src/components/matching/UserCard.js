import React, { useState } from 'react';
import './UserCard.css';

const UserCard = ({ user, onSwipe, currentIndex, totalCards, style }) => {
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState(null);

  if (!user) return null;

  const handleTouchStart = (e) => {
    setStartX(e.touches[0].clientX);
    setIsDragging(true);
    setSwipeDirection(null);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const currentX = e.touches[0].clientX;
    const deltaX = currentX - startX;
    setCurrentX(deltaX);

    // Определяем направление свайпа для анимации
    if (deltaX > 50) setSwipeDirection('right');
    else if (deltaX < -50) setSwipeDirection('left');
    else setSwipeDirection(null);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;

    const swipeDistance = currentX;
    if (Math.abs(swipeDistance) > 100) {
      if (swipeDistance > 0) {
        onSwipe(user.id, 'like');
      } else {
        onSwipe(user.id, 'pass');
      }
    }

    // Сброс анимации
    setCurrentX(0);
    setIsDragging(false);
    setSwipeDirection(null);
  };

  const handleSwipe = (action) => {
    setSwipeDirection(action === 'like' ? 'right' : 'left');
    setTimeout(() => {
      onSwipe(user.id, action);
    }, 300);
  };

  const cardStyle = {
    transform: `translateX(${currentX}px) rotate(${currentX * 0.1}deg)`,
    transition: isDragging ? 'none' : 'transform 0.3s ease',
    ...style
  };

  const getLevelText = (level) => {
    const levels = {
      'beginner': 'Начинающий',
      'intermediate': 'Средний',
      'advanced': 'Продвинутый'
    };
    return levels[level] || level;
  };

  return (
    <div
      className={`user-card ${swipeDirection ? `swipe-${swipeDirection}` : ''}`}
      style={cardStyle}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="card-header">
        <span className="card-counter">{currentIndex + 1} / {totalCards}</span>
      </div>

      <div className="user-image">
        <div className="avatar-placeholder">
          {user.first_name?.charAt(0) || user.username?.charAt(0) || 'U'}
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
            <span className="meta-value">{user.year_of_study ? `${user.year_of_study} курс` : 'Не указан'}</span>
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

        {user.subjects && user.subjects.length > 0 && (
          <div className="user-subjects">
            <h4>Интересы:</h4>
            <div className="subjects-list">
              {user.subjects.slice(0, 5).map(subject => (
                <span key={subject.id} className="subject-tag">
                  {subject.name} ({getLevelText(subject.level)})
                </span>
              ))}
              {user.subjects.length > 5 && (
                <span className="subject-tag more">
                  +{user.subjects.length - 5} еще
                </span>
              )}
            </div>
          </div>
        )}

        {/* Индикаторы свайпа */}
        <div className="swipe-indicators">
          <div className={`indicator left ${swipeDirection === 'left' ? 'active' : ''}`}>
            ❌ Пропустить
          </div>
          <div className={`indicator right ${swipeDirection === 'right' ? 'active' : ''}`}>
            ❤️ Лайк
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