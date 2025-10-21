import React, { useState, useRef, useEffect } from 'react';
import './MessageInput.css';

const MessageInput = ({ onSendMessage, onCreateSession, otherUser }) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSessionOptions, setShowSessionOptions] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const sessionOptionsRef = useRef(null);
  const emojiPickerRef = useRef(null);

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
        sessionMessage = '📅 Хочешь запланировать учебную сессию на этой неделе? Когда тебе удобно?';
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

  // Функция для добавления эмодзи
  const handleEmojiSelect = (emoji) => {
    setMessage(prev => prev + emoji);
    setShowEmojiPicker(false);

    // Фокус обратно на textarea
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const autoResizeTextarea = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  };

  // Закрытие dropdown при клике вне его
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sessionOptionsRef.current && !sessionOptionsRef.current.contains(event.target)) {
        setShowSessionOptions(false);
      }
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

  // Популярные эмодзи для быстрого выбора
  const popularEmojis = [
    '😊', '😂', '🥰', '😎', '🤔', '👏', '🎉', '🚀',
    '📚', '🎓', '💡', '⭐', '🔥', '💯', '❤️', '👍',
    '👋', '🎯', '💪', '🤝', '🙏', '✍️', '🧠', '🌟'
  ];

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

      {/* Быстрые ответы */}
      {!message.trim() && (
        <div className="quick-replies">
          {quickReplies.map((reply, index) => (
            <button
              key={index}
              className="quick-reply-btn"
              onClick={() => handleQuickReply(reply.text)}
              type="button"
              aria-label={`Быстрый ответ: ${reply.text}`}
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
          <div className="session-options-container" ref={sessionOptionsRef}>
            <button
              className="session-options-btn"
              onClick={() => {
                setShowSessionOptions(!showSessionOptions);
                setShowEmojiPicker(false);
              }}
              title="Предложить учебную сессию"
              aria-label="Предложить учебную сессию"
              type="button"
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

          {/* Кнопка эмодзи */}
          <div className="emoji-picker-container" ref={emojiPickerRef}>
            <button
              className="emoji-btn"
              onClick={() => {
                setShowEmojiPicker(!showEmojiPicker);
                setShowSessionOptions(false);
              }}
              title="Эмодзи"
              aria-label="Выбрать эмодзи"
              type="button"
            >
              😊
            </button>

            {showEmojiPicker && (
              <div className="emoji-picker">
                <div className="emoji-picker-header">
                  <span>Выберите эмодзи</span>
                  <button
                    className="emoji-picker-close"
                    onClick={() => setShowEmojiPicker(false)}
                    type="button"
                  >
                    ×
                  </button>
                </div>
                <div className="emoji-grid">
                  {popularEmojis.map((emoji, index) => (
                    <button
                      key={index}
                      className="emoji-item"
                      onClick={() => handleEmojiSelect(emoji)}
                      type="button"
                      aria-label={`Эмодзи ${emoji}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
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
            aria-label="Поле ввода сообщения"
          />

          <button
            onClick={handleSend}
            disabled={!message.trim()}
            className="send-btn"
            title="Отправить сообщение"
            aria-label="Отправить сообщение"
            type="button"
          >
            {message.trim() ? '➤' : '⚡'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageInput;