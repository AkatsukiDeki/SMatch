import React from 'react';
import './ChatList.css'

const ChatList = ({ chatRooms, selectedChat, onSelectChat, loading }) => {
  if (loading) {
    return (
      <div className="chat-list">
        <div className="loading-chats">
          <div className="spinner"></div>
          <p>Загрузка чатов...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-list">
      {chatRooms.length === 0 ? (
        <div className="no-chats">
          <div className="no-chats-icon">💬</div>
          <p>У вас пока нет чатов</p>
          <small>Начните общение с взаимных лайков</small>
        </div>
      ) : (
        <div className="chat-items">
          {chatRooms.map(chat => (
            <div
              key={chat.id}
              className={`chat-item ${selectedChat?.id === chat.id ? 'active' : ''}`}
              onClick={() => onSelectChat(chat)}
            >
              <div className="chat-avatar">
                {chat.other_user_profile?.first_name?.charAt(0)?.toUpperCase() ||
                 chat.other_user_profile?.username?.charAt(0)?.toUpperCase() || 'U'}
              </div>

              <div className="chat-info">
                <div className="chat-user-main">
                  <strong>
                    {chat.other_user_profile?.first_name && chat.other_user_profile?.last_name
                      ? `${chat.other_user_profile.first_name} ${chat.other_user_profile.last_name}`
                      : chat.other_user_profile?.username || 'Пользователь'
                    }
                  </strong>
                  {chat.unread_count > 0 && (
                    <span className="unread-badge">{chat.unread_count}</span>
                  )}
                </div>

                <div className="last-message-preview">
                  {chat.last_message?.content
                    ? (chat.last_message.content.length > 30
                        ? chat.last_message.content.substring(0, 30) + '...'
                        : chat.last_message.content)
                    : 'Начните общение'
                  }
                </div>

                <div className="chat-meta">
                  <span className="chat-faculty">
                    {chat.other_user_profile?.faculty || 'Студент'}
                  </span>
                  {chat.last_message && (
                    <span className="message-time">
                      {new Date(chat.last_message.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChatList;