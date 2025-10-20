// src/components/chat/MessageList.js
import React, { useEffect, useRef } from 'react';

const MessageList = ({ messages, currentUser, otherUserProfile, onCreateSession }) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Группируем сообщения по датам
  const groupMessagesByDate = (messages) => {
    const groups = {};
    messages.forEach(message => {
      const date = new Date(message.timestamp).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    return groups;
  };

  const shouldShowDateSeparator = (currentMessage, previousMessage) => {
    if (!previousMessage) return true;

    const currentDate = new Date(currentMessage.timestamp).toDateString();
    const previousDate = new Date(previousMessage.timestamp).toDateString();

    return currentDate !== previousDate;
  };

  return (
    <div className="message-list">
      {messages.length === 0 ? (
        <div className="no-messages">
          <div className="no-messages-icon">💬</div>
          <p>Пока нет сообщений</p>
          <small>Начните общение первым или предложите создать учебную сессию!</small>
          {onCreateSession && otherUserProfile && (
            <button
              className="suggest-session-btn"
              onClick={() => onCreateSession(otherUserProfile)}
            >
              📚 Предложить учебную сессию
            </button>
          )}
        </div>
      ) : (
        <div className="messages-container">
          {messages.map((message, index) => {
            const previousMessage = index > 0 ? messages[index - 1] : null;
            const showDateSeparator = shouldShowDateSeparator(message, previousMessage);

            return (
              <div key={message.id} className="message-group">
                {showDateSeparator && (
                  <div className="date-separator">
                    <span>{formatDate(message.timestamp)}</span>
                  </div>
                )}

                <div className={`message ${message.sender === currentUser.id ? 'own' : 'other'}`}>
                  {message.sender !== currentUser.id && (
                    <div className="message-sender-avatar">
                      {otherUserProfile?.username?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                  )}

                  <div className="message-content-wrapper">
                    {message.sender !== currentUser.id && (
                      <div className="message-sender-name">
                        {otherUserProfile?.first_name && otherUserProfile?.last_name
                          ? `${otherUserProfile.first_name} ${otherUserProfile.last_name}`
                          : otherUserProfile?.username || 'Пользователь'
                        }
                      </div>
                    )}

                    <div className="message-content">
                      <div className="message-text">{message.content}</div>
                      <div className="message-time">
                        {formatTime(message.timestamp)}
                        {message.is_read && message.sender === currentUser.id && (
                          <span className="read-status" title="Прочитано">✓✓</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {message.sender === currentUser.id && (
                    <div className="message-sender-avatar own">
                      {currentUser.username?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;