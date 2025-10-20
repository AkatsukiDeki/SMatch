import React, { useState, useRef, useEffect } from 'react';
import './MessageInput.css';

const MessageInput = ({ onSendMessage, onCreateSession, otherUser }) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSessionOptions, setShowSessionOptions] = useState(false);
  const textareaRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const handleChange = (e) => {
    const value = e.target.value;
    setMessage(value);

    // Симуляция индикатора печати
    if (!isTyping && value.trim()) {
      setIsTyping(true);
    }

    // Сбрасываем таймер печати
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 1000);
  };

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
      setIsTyping(false);

      // Сбрасываем высоту textarea
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickSession = (type) => {
    let sessionMessage = '';

    switch (type) {
      case 'quick':
        sessionMessage = '🎯 Предлагаю быстро собраться на учебную сессию! Есть время позаниматься?';
        break;
      case 'planned':
        sessionMessage = '📅 Хочешь запланировать учебную сессию на этой неделе?';
        break;
      case 'subject':
        sessionMessage = `📚 Предлагаю создать сессию по предмету. Какой предмет тебя интересует?`;
        break;
      default:
        sessionMessage = '📚 Предлагаю создать учебную сессию!';
    }

    onSendMessage(sessionMessage);
    setShowSessionOptions(false);
  };

  const handleCreateFullSession = () => {
    if (onCreateSession && otherUser) {
      onCreateSession(otherUser);
    }
    setShowSessionOptions(false);
  };

  const autoResizeTextarea = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  };

  useEffect(() => {
    autoResizeTextarea();
  }, [message]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const quickReplies = [
    { text: 'Привет! 👋', emoji: '👋' },
    { text: 'Как дела?', emoji: '😊' },
    { text: 'Есть время позаниматься?', emoji: '📚' },
    { text: 'Отлично понял!', emoji: '✅' },
  ];

  const handleQuickReply = (text) => {
    onSendMessage(text);
  };

  return (
    <div className="message-input-container">
      {/* Индикатор печати */}
      {isTyping && otherUser && (
        <div className="typing-indicator">
          <div className="typing-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <span className="typing-text">
            {otherUser.first_name || otherUser.username} печатает...
          </span>
        </div>
      )}

      {/* Быстрые ответы (только для пустого инпута) */}
      {/* УДАЛЕНО: проверка messages.length > 0, так как messages не передается в пропсах */}
      {!message.trim() && (
        <div className="quick-replies">
          {quickReplies.map((reply, index) => (
            <button
              key={index}
              className="quick-reply-btn"
              onClick={() => handleQuickReply(reply.text)}
            >
              <span className="quick-reply-emoji">{reply.emoji}</span>
              {reply.text}
            </button>
          ))}
        </div>
      )}

      <div className="message-input">
        <div className="input-actions">
          {/* Кнопка быстрых сессий */}
          <div className="session-options-container">
            <button
              className="session-options-btn"
              onClick={() => setShowSessionOptions(!showSessionOptions)}
              title="Предложить учебную сессию"
            >
              📚
            </button>

            {showSessionOptions && (
              <div className="session-options-dropdown">
                <div className="session-option" onClick={() => handleQuickSession('quick')}>
                  <span className="session-emoji">🎯</span>
                  <div className="session-info">
                    <div className="session-title">Быстрая сессия</div>
                    <div className="session-desc">Предложить прямо сейчас</div>
                  </div>
                </div>

                <div className="session-option" onClick={() => handleQuickSession('planned')}>
                  <span className="session-emoji">📅</span>
                  <div className="session-info">
                    <div className="session-title">Запланировать</div>
                    <div className="session-desc">На этой неделе</div>
                  </div>
                </div>

                <div className="session-option" onClick={() => handleQuickSession('subject')}>
                  <span className="session-emoji">📖</span>
                  <div className="session-info">
                    <div className="session-title">По предмету</div>
                    <div className="session-desc">Обсудить предмет</div>
                  </div>
                </div>

                <div className="session-option" onClick={handleCreateFullSession}>
                  <span className="session-emoji">✨</span>
                  <div className="session-info">
                    <div className="session-title">Полная сессия</div>
                    <div className="session-desc">Создать с деталями</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Кнопка эмодзи (заглушка для будущей реализации) */}
          <button className="emoji-btn" title="Эмодзи">
            😊
          </button>
        </div>

        <div className="input-container">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleChange}
            onKeyPress={handleKeyPress}
            placeholder={`Напишите сообщение ${otherUser ? `для ${otherUser.first_name || otherUser.username}` : ''}...`}
            rows="1"
            className="message-textarea"
          />

          <button
            onClick={handleSend}
            disabled={!message.trim()}
            className="send-btn"
            title="Отправить сообщение"
          >
            {message.trim() ? '➤' : '⚡'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageInput;