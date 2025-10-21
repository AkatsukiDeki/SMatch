import React, { useEffect, useRef } from 'react';
import './MessageList.css';

const MessageList = ({ messages, currentUser, otherUserProfile, onCreateSession }) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end"
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatTime = (timestamp) => {
    try {
      return new Date(timestamp).toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return '--:--';
    }
  };

  const formatDate = (timestamp) => {
    try {
      return new Date(timestamp).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch (error) {
      return 'Неизвестная дата';
    }
  };

  // Группируем сообщения по датам
  const groupMessagesByDate = (messages) => {
    const groups = {};
    messages.forEach(message => {
      try {
        const date = new Date(message.timestamp).toDateString();
        if (!groups[date]) {
          groups[date] = [];
        }
        groups[date].push(message);
      } catch (error) {
        console.error('Error grouping message:', error);
      }
    });
    return groups;
  };

  const shouldShowDateSeparator = (currentMessage, previousMessage) => {
    if (!previousMessage) return true;

    try {
      const currentDate = new Date(currentMessage.timestamp).toDateString();
      const previousDate = new Date(previousMessage.timestamp).toDateString();
      return currentDate !== previousDate;
    } catch (error) {
      return true;
    }
  };

  // Получаем инициалы для аватара
  const getInitials = (user) => {
    if (!user) return 'U';
    if (user.first_name && user.last_name) {
      return `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase();
    }
    return user.username ? user.username.charAt(0).toUpperCase() : 'U';
  };

  const messageGroups = groupMessagesByDate(messages);
  const allMessages = Object.values(messageGroups).flat();

  return (
    <div className="message-list">
      {allMessages.length === 0 ? (
        <div className="no-messages">
          <div className="no-messages-icon">💬</div>
          <p>Пока нет сообщений</p>
          <small>Начните общение первым или предложите создать учебную сессию!</small>
          {onCreateSession && otherUserProfile && (
            <button
              className="suggest-session-btn"
              onClick={() => onCreateSession(otherUserProfile)}
              type="button"
            >
              📚 Предложить учебную сессию
            </button>
          )}
        </div>
      ) : (
        <div className="messages-container">
          {allMessages.map((message, index) => {
            const previousMessage = index > 0 ? allMessages[index - 1] : null;
            const showDateSeparator = shouldShowDateSeparator(message, previousMessage);
            const isOwnMessage = message.sender === currentUser.id;

            return (
              <div key={message.id || `msg-${index}`} className="message-group">
                {showDateSeparator && (
                  <div className="date-separator">
                    <span>{formatDate(message.timestamp)}</span>
                  </div>
                )}

                <div className={`message ${isOwnMessage ? 'own' : 'other'}`}>
                  {/* Аватар отправителя (для чужих сообщений) */}
                  {!isOwnMessage && (
                    <div className="message-sender-avatar">
                      {getInitials(otherUserProfile)}
                    </div>
                  )}

                  <div className="message-content-wrapper">
                    {/* Имя отправителя (для чужих сообщений) */}
                    {!isOwnMessage && (
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
                        {message.is_read && isOwnMessage && (
                          <span className="read-status" title="Прочитано">✓✓</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Аватар отправителя (для своих сообщений) */}
                  {isOwnMessage && (
                    <div className="message-sender-avatar own">
                      {getInitials(currentUser)}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      <div ref={messagesEndRef} className="scroll-anchor" />
    </div>
  );
};

export default MessageList;