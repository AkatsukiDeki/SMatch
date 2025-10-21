import React from 'react';
import './UserSelector.css';

const UserSelector = ({ mutualLikes, onSelectUser, onClose }) => {
  return (
    <div className="user-selector-overlay">
      <div className="user-selector-modal">
        <div className="user-selector-header">
          <h3>Выберите собеседника</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="user-selector-content">
          {mutualLikes.length === 0 ? (
            <div className="no-users">
              <div className="no-users-icon">👥</div>
              <h4>Пока нет доступных пользователей</h4>
              <p>Взаимные лайки появятся здесь после свайпов в разделе "Поиск"</p>
              <button className="go-to-matching-btn" onClick={onClose}>
                Перейти к поиску
              </button>
            </div>
          ) : (
            <div className="users-list">
              {mutualLikes.map((item) => (
                <div
                  key={item.user.id}
                  className="user-item"
                  onClick={() => onSelectUser(item.user)}
                >
                  <div className="user-avatar">
                    {item.user.first_name?.charAt(0) || item.user.username?.charAt(0) || 'U'}
                  </div>
                  <div className="user-info">
                    <h4>
                      {item.user.first_name && item.user.last_name
                        ? `${item.user.first_name} ${item.user.last_name}`
                        : item.user.username
                      }
                    </h4>
                    <p className="user-username">@{item.user.username}</p>
                    <div className="user-details">
                      <span className="user-faculty">{item.user.faculty}</span>
                      {item.user.year_of_study && (
                        <span className="user-year">{item.user.year_of_study} курс</span>
                      )}
                    </div>
                  </div>
                  <div className="user-action">
                    <button className="start-chat-btn">
                      💬 Начать чат
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserSelector;