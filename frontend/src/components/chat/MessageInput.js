import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNotification } from '../../context/NotificationContext';
import EnhancedWebSocketService from '../../services/EnhancedWebSocketService';
import './EnhancedMessageInput.css';

const EnhancedMessageInput = ({ onSendMessage, onCreateSession, otherUser, chatRoomId }) => {
  const [message, setMessage] = useState('');
  const [showSessionOptions, setShowSessionOptions] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const { addNotification } = useNotification();

  const textareaRef = useRef(null);
  const sessionOptionsRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Обработчик тайпинга от других пользователей
  const handleTypingIndicator = useCallback((data) => {
    if (data.type === 'typing' && data.user_id !== otherUser?.id) {
      setOtherUserTyping(data.is_typing);

      if (data.is_typing) {
        // Автоматически скрываем через 3 секунды
        setTimeout(() => {
          setOtherUserTyping(false);
        }, 3000);
      }
    }
  }, [otherUser]);

  // Отправка индикатора тайпинга
  const sendTypingIndicator = useCallback((typing) => {
    if (chatRoomId && EnhancedWebSocketService.isConnected) {
      EnhancedWebSocketService.sendTypingIndicator(typing);
    }
  }, [chatRoomId]);

  // Обработчик изменения сообщения
  const handleChange = (e) => {
    const newMessage = e.target.value;
    setMessage(newMessage);

    // Отправляем индикатор тайпинга
    if (newMessage.length > 0 && !isTyping) {
      setIsTyping(true);
      sendTypingIndicator(true);
    } else if (newMessage.length === 0 && isTyping) {
      setIsTyping(false);
      sendTypingIndicator(false);
    }

    // Сбрасываем и перезапускаем таймер тайпинга
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        sendTypingIndicator(false);
      }
    }, 1000);
  };

  const handleSend = async () => {
    if (message.trim() && !isSending) {
      setIsSending(true);

      // Останавливаем тайпинг
      setIsTyping(false);
      sendTypingIndicator(false);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      try {
        const result = await onSendMessage(message.trim());

        if (result && result.queued) {
          addNotification({
            type: 'info',
            title: 'Сообщение в очереди',
            message: 'Сообщение будет отправлено когда соединение восстановится',
            duration: 3000
          });
        }

        setMessage('');
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
        }
      } catch (error) {
        console.error('Error sending message:', error);
        addNotification({
          type: 'error',
          title: 'Ошибка отправки',
          message: 'Не удалось отправить сообщение',
          duration: 5000
        });
      } finally {
        setIsSending(false);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Быстрые сессии
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

  // Эмодзи
  const handleEmojiSelect = (emoji) => {
    setMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
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

  // Эффекты
  useEffect(() => {
    autoResizeTextarea();
  }, [message]);

  useEffect(() => {
    const removeTypingHandler = EnhancedWebSocketService.onMessage(handleTypingIndicator);

    return () => {
      removeTypingHandler();
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [handleTypingIndicator]);

  const quickReplies = [
    { text: 'Привет! 👋', emoji: '👋' },
    { text: 'Как дела?', emoji: '😊' },
    { text: 'Есть время позаниматься?', emoji: '📚' },
    { text: 'Отлично понял!', emoji: '✅' },
  ];

  const popularEmojis = [
    '😊', '😂', '🥰', '😎', '🤔', '👏', '🎉', '🚀',
    '📚', '🎓', '💡', '⭐', '🔥', '💯', '❤️', '👍',
    '👋', '🎯', '💪', '🤝', '🙏', '✍️', '🧠', '🌟'
  ];

  return (
    <div className="enhanced-message-input">
      {/* Индикатор тайпинга другого пользователя */}
      {otherUserTyping && (
        <div className="typing-indicator">
          <div className="typing-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <span className="typing-text">
            {otherUser?.first_name || otherUser?.username || 'Кто-то'} печатает...
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
              onClick={() => onSendMessage(reply.text)}
              type="button"
              disabled={isSending}
            >
              <span className="quick-reply-emoji">{reply.emoji}</span>
              {reply.text}
            </button>
          ))}
        </div>
      )}

      <div className="input-container">
        <div className="input-actions">
          {/* Сессии */}
          <div className="session-options-container" ref={sessionOptionsRef}>
            <button
              className="session-options-btn"
              onClick={() => {
                setShowSessionOptions(!showSessionOptions);
                setShowEmojiPicker(false);
              }}
              disabled={isSending}
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

                {onCreateSession && (
                  <div className="session-option" onClick={handleCreateFullSession}>
                    <span className="session-emoji">✨</span>
                    <div className="session-info">
                      <div className="session-title">Полная сессия</div>
                      <div className="session-desc">Создать с деталями</div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Эмодзи */}
          <div className="emoji-picker-container" ref={emojiPickerRef}>
            <button
              className="emoji-btn"
              onClick={() => {
                setShowEmojiPicker(!showEmojiPicker);
                setShowSessionOptions(false);
              }}
              disabled={isSending}
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
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="text-input-wrapper">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleChange}
            onKeyPress={handleKeyPress}
            placeholder={`Напишите сообщение ${otherUser ? `для ${otherUser.first_name || otherUser.username}` : ''}...`}
            rows="1"
            className="message-textarea"
            disabled={isSending}
          />

          {/* Индикатор тайпинга текущего пользователя */}
          {isTyping && (
            <div className="own-typing-indicator">
              <span>Вы печатаете...</span>
            </div>
          )}
        </div>

        <button
          onClick={handleSend}
          disabled={!message.trim() || isSending}
          className="send-btn"
        >
          {isSending ? (
            <div className="sending-spinner"></div>
          ) : message.trim() ? (
            '➤'
          ) : (
            '⚡'
          )}
        </button>
      </div>

      {/* Статус отправки */}
      {isSending && (
        <div className="sending-status">
          <span>Отправка сообщения...</span>
        </div>
      )}
    </div>
  );
};

export default EnhancedMessageInput;