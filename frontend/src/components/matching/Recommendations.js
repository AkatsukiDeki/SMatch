// src/components/matching/Recommendations.js
import React from 'react';
import UserCard from './UserCard';
import './Recommendations.css';

const Recommendations = ({ recommendations, onSwipe, loading }) => {
  if (loading) {
    return (
      <div className="recommendations-loading">
        <div className="spinner"></div>
        <p>Загрузка рекомендаций...</p>
      </div>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="no-recommendations">
        <h3>Пока нет рекомендаций</h3>
        <p>Обновите позже или добавьте больше предметов в профиль</p>
      </div>
    );
  }

  return (
    <div className="recommendations-container">
      <div className="recommendations-grid">
        {recommendations.map((user, index) => (
          <div key={user.id} className="recommendation-card">
            <UserCard
              user={user}
              onSwipe={onSwipe}
              currentIndex={index}
              totalCards={recommendations.length}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Recommendations;