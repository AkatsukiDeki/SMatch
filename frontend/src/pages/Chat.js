import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { chatAPI, matchingAPI, studySessionsAPI } from '../services/api';
import WebSocketService from '../services/websocket';
import { useNavigate } from 'react-router-dom';
import { debounce } from 'lodash';
import MessageInput from '../components/chat/MessageInput';
import './Chat.css';

// Мемоизированный компонент элемента чата
const ChatItem = React.memo(({ chat, isSelected, onClick }) => {
  const getInitials = (profile) => {
    if (!profile) return '?';
    return profile.first_name?.charAt(0) ||
           profile.username?.charAt(0) ||
           '?';
  };

  const getDisplayName = (profile) => {
    if (!profile) return 'Загрузка...';
    return profile.first_name || profile.username || 'Неизвестный';
  };

  const getFaculty = (profile) => {
    return profile?.faculty || 'Факультет не указан';
  };

  return (
    <div className={`chat-item ${isSelected ? 'active' : ''}`} onClick={onClick}>
      <div className="chat-avatar">
        {getInitials(chat.other_user_profile)}
      </div>
      <div className="chat-info">
        <div className="chat-header">
          <strong>{getDisplayName(chat.other_user_profile)}</strong>
          {chat.unread_count > 0 && (
            <span className="unread-badge">{chat.unread_count}</span>
          )}
        </div>
        <div className="last-message">
          {chat.last_message?.content || 'Нет сообщений'}
        </div>
        <div className="chat-meta">
          <span>{getFaculty(chat.other_user_profile)}</span>
        </div>
      </div>
    </div>
  );
});

ChatItem.displayName = 'ChatItem';

const Chat = () => {
  const { user } = useAuth();
  const [chatRooms, setChatRooms] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const navigate = useNavigate();

  // Функция для нормализации данных пользователя
  const normalizeUserProfile = (profile) => {
    if (!profile) return null;

    return {
      id: profile.id,
      username: profile.username || 'Неизвестный',
      first_name: profile.first_name || profile.username || 'Неизвестный',
      faculty: profile.faculty || 'Факультет не указан',
      avatar: profile.avatar
    };
  };

  // Нормализация данных чата
  const normalizeChatData = (chat) => {
    return {
      ...chat,
      other_user_profile: normalizeUserProfile(chat.other_user_profile)
    };
  };

  // Загрузка списка чатов
  const loadChatRooms = useCallback(async () => {
    try {
      setLoading(true);
      const response = await chatAPI.getChatRooms();

      // Нормализуем данные чатов
      const normalizedChats = response.data.map(normalizeChatData);
      setChatRooms(normalizedChats);
      setError('');
    } catch (error) {
      console.error('Ошибка загрузки чатов:', error);
      setError('Не удалось загрузить чаты');
    } finally {
      setLoading(false);
    }
  }, []);

  // Оптимизированная загрузка чатов с debounce
  const debouncedLoadChats = useCallback(
    debounce(loadChatRooms, 300),
    [loadChatRooms]
  );

  // Загрузка сообщений
  const loadMessages = useCallback(async (chatRoomId) => {
    try {
      const response = await chatAPI.getMessages(chatRoomId);
      setMessages(response.data);
      setError('');
    } catch (error) {
      console.error('Ошибка загрузки сообщений:', error);
      setError('Не удалось загрузить сообщения');
    }
  }, []);

  // Отправка сообщения с оптимистичным обновлением
  const sendMessage = async (messageContent) => {
    if (!selectedChat || !messageContent.trim() || sending) return;

    const content = messageContent.trim();

    // Создаем временное сообщение для оптимистичного обновления
    const tempMessage = {
      id: `temp-${Date.now()}`,
      content: content,
      sender: user.id,
      timestamp: new Date().toISOString(),
      isSending: true
    };

    try {
      setSending(true);
      setNewMessage('');
      adjustTextareaHeight();

      // Оптимистичное обновление UI
      setMessages(prev => [...prev, tempMessage]);

      // Отправка на сервер
      await chatAPI.sendMessage(selectedChat.id, { content: content });

      // Обновляем сообщения с сервера
      await loadMessages(selectedChat.id);
      debouncedLoadChats();

    } catch (error) {
      console.error('Ошибка отправки сообщения:', error);
      setError('Не удалось отправить сообщение');
      setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
    } finally {
      setSending(false);
    }
  };

  // Функция для создания учебной сессии
  const handleCreateSession = async (partnerUser) => {
    try {
      console.log('Создание сессии с пользователем:', partnerUser);

      // Создаем базовую сессию
      const sessionData = {
        title: `Совместная сессия с ${partnerUser.first_name || partnerUser.username}`,
        description: `Учебная сессия с ${partnerUser.first_name || partnerUser.username}. Давайте вместе позанимаемся!`,
        subject_name: 'Совместное обучение',
        scheduled_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Завтра
        duration_minutes: 60,
        max_participants: 2
      };

      const response = await studySessionsAPI.createSession(sessionData);
      const newSession = response.data;

      console.log('✅ Сессия создана:', newSession);

      // Отправляем приглашение
      await studySessionsAPI.sendInvitation(newSession.id, partnerUser.id);

      // Отправляем сообщение в чат о создании сессии
      const invitationMessage = `📚 Я создал(а) учебную сессию "${newSession.title}"! Присоединяйтесь!`;
      await sendMessage(invitationMessage);

      alert('✅ Учебная сессия создана и приглашение отправлено!');

    } catch (error) {
      console.error('❌ Ошибка создания сессии:', error);
      alert('Ошибка при создании сессии: ' + (error.response?.data?.error || error.message));
    }
  };

  // Функция для прокрутки к последнему сообщению
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Автоматическое изменение высоты textarea
  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  };

  // Обработка нажатия клавиш
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(newMessage);
    }
  };

  // Обработчик изменения текста сообщения
  const handleMessageChange = (e) => {
    setNewMessage(e.target.value);
  };

  // Обработчик выбора чата
  const handleChatSelect = (chat) => {
    const normalizedChat = normalizeChatData(chat);
    setSelectedChat(normalizedChat);
    loadMessages(normalizedChat.id);
  };

  // Получение информации о партнере по чату
  const getPartnerInfo = (chat) => {
    if (!chat?.other_user_profile) {
      return {
        initials: '?',
        name: 'Загрузка...',
        faculty: 'Факультет не указан'
      };
    }

    const profile = chat.other_user_profile;
    return {
      initials: profile.first_name?.charAt(0) || profile.username?.charAt(0) || '?',
      name: profile.first_name || profile.username || 'Неизвестный',
      faculty: profile.faculty || 'Факультет не указан'
    };
  };

  const partnerInfo = selectedChat ? getPartnerInfo(selectedChat) : null;

  // Инициализация при загрузке компонента
  useEffect(() => {
    if (user) {
      loadChatRooms();
    }
  }, [user, loadChatRooms]);

  // Загрузка сообщений при выборе чата
  useEffect(() => {
    if (selectedChat && user) {
      loadMessages(selectedChat.id);
    }
  }, [selectedChat, user, loadMessages]);

  // Прокрутка к последнему сообщению при изменении сообщений
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Автоматическая регулировка высоты textarea
  useEffect(() => {
    adjustTextareaHeight();
  }, [newMessage]);

  // Очистка при размонтировании компонента
  useEffect(() => {
    return () => {
      WebSocketService.disconnect();
      debouncedLoadChats.cancel();
    };
  }, [debouncedLoadChats]);

  if (!user) {
    return (
      <div className="chat-page">
        <div className="auth-required">
          <h2>Пожалуйста, войдите в систему</h2>
          <button onClick={() => navigate('/login')} className="login-btn">
            Войти
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-page">
      <div className="chat-container">
        {/* Боковая панель с чатами */}
        <div className="chat-sidebar">
          <div className="sidebar-header">
            <h2>Чаты</h2>
            <button
              className="new-chat-btn"
              onClick={() => navigate('/matching')}
              title="Найти собеседников"
              aria-label="Найти собеседников"
            >
              🔍
            </button>
          </div>

          <div className="chat-list">
            {loading ? (
              <div className="loading">Загрузка чатов...</div>
            ) : error ? (
              <div className="no-chats">
                <div className="no-chats-icon">⚠️</div>
                <p>{error}</p>
                <button onClick={loadChatRooms} className="find-partners-btn">
                  Повторить
                </button>
              </div>
            ) : chatRooms.length === 0 ? (
              <div className="no-chats">
                <div className="no-chats-icon">💬</div>
                <p>Нет чатов</p>
                <small>Найдите партнеров в разделе "Поиск"</small>
              </div>
            ) : (
              chatRooms.map(chat => (
                <ChatItem
                  key={chat.id}
                  chat={chat}
                  isSelected={selectedChat?.id === chat.id}
                  onClick={() => handleChatSelect(chat)}
                />
              ))
            )}
          </div>
        </div>

        {/* Область сообщений */}
        <div className="chat-main">
          {selectedChat ? (
            <>
              <div className="chat-header">
                <div className="chat-partner">
                  <div className="partner-avatar">
                    {partnerInfo.initials}
                  </div>
                  <div className="partner-info">
                    <h3>{partnerInfo.name}</h3>
                    <span>{partnerInfo.faculty}</span>
                  </div>
                </div>
              </div>

              <div className="messages-container">
                {messages.length === 0 ? (
                  <div className="no-messages">
                    <div className="no-messages-icon">💭</div>
                    <p>Пока нет сообщений</p>
                    <small>Начните общение первым!</small>
                  </div>
                ) : (
                  <>
                    {messages.map(message => (
                      <div
                        key={message.id}
                        className={`message ${message.sender === user.id ? 'own' : 'other'} ${message.isSending ? 'sending' : ''}`}
                      >
                        <div className="message-content">
                          <div className="message-text">{message.content}</div>
                          <div className="message-time">
                            {new Date(message.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                            {message.isSending && (
                              <span className="sending-indicator"> • Отправка...</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              <MessageInput
                onSendMessage={sendMessage}
                onCreateSession={handleCreateSession}
                otherUser={selectedChat.other_user_profile}
              />
            </>
          ) : (
            <div className="chat-welcome">
              <div className="welcome-content">
                <div className="welcome-icon">💬</div>
                <h2>Добро пожаловать в чат</h2>
                <p>Выберите чат для начала общения</p>
                <button
                  onClick={() => navigate('/matching')}
                  className="find-partners-btn"
                >
                  🔍 Найти партнеров
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;