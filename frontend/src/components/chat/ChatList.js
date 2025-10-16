// src/components/chat/ChatList.js
import React from 'react';

const ChatList = ({ chatRooms, selectedChat, onSelectChat }) => {
  return (
    <div className="chat-list">
      <div className="chat-list-header">
        <h3>Чаты</h3>
        <span className="badge">{chatRooms.length}</span>
      </div>

      <div className="chat-items">
        {chatRooms.length === 0 ? (
          <div className="no-chats">
            <p>У вас пока нет чатов</p>
            <small>Найдите партнера для обучения в разделе "Поиск"</small>
          </div>
        ) : (
          chatRooms.map(chat => (
            <div
              key={chat.id}
              className={`chat-item ${selectedChat?.id === chat.id ? 'active' : ''}`}
              onClick={() => onSelectChat(chat)}
            >
              <div className="chat-avatar">
                {chat.other_user_profile?.username?.charAt(0).toUpperCase() || 'U'}
              </div>

              <div className="chat-info">
                <div className="chat-user">
                  <strong>{chat.other_user_profile?.username || 'Пользователь'}</strong>
                  {chat.unread_count > 0 && (
                    <span className="unread-count">{chat.unread_count}</span>
                  )}
                </div>

                <div className="last-message">
                  {chat.last_message?.content
                    ? (chat.last_message.content.length > 30
                        ? chat.last_message.content.substring(0, 30) + '...'
                        : chat.last_message.content)
                    : 'Нет сообщений'
                  }
                </div>

                <div className="chat-meta">
                  <span className="faculty">{chat.other_user_profile?.faculty}</span>
                  {chat.last_message && (
                    <span className="time">
                      {new Date(chat.last_message.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ChatList;