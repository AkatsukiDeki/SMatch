import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { chatAPI, matchingAPI, studySessionsAPI } from '../services/api';
import WebSocketService from '../services/websocket';
import MessageList from '../components/chat/MessageList';
import MessageInput from '../components/chat/MessageInput';
import { useNavigate } from 'react-router-dom';
import { debounce } from 'lodash';
import './Chat.css';

// Мемоизированный компонент элемента чата
const ChatItem = React.memo(({ chat, isSelected, onClick }) => {
  const getInitials = (profile) => {
    if (!profile) return '?';
    return (profile.first_name?.charAt(0) || profile.username?.charAt(0) || '?').toUpperCase();
  };

  const getDisplayName = (profile) => {
    if (!profile) return 'Загрузка...';
    return profile.first_name || profile.username || 'Неизвестный';
  };

  const getFaculty = (profile) => {
    return profile?.faculty || 'Факультет не указан';
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    try {
      return new Date(timestamp).toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return '';
    }
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
          {chat.last_message?.timestamp && (
            <span className="message-time">
              {formatTime(chat.last_message.timestamp)}
            </span>
          )}
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  // Функция для нормализации данных пользователя
  const normalizeUserProfile = useCallback((profile) => {
    if (!profile) return null;
    return {
      id: profile.id,
      username: profile.username || 'Неизвестный',
      first_name: profile.first_name || profile.username || 'Неизвестный',
      faculty: profile.faculty || 'Факультет не указан',
      avatar: profile.avatar
    };
  }, []);

  // Нормализация данных чата
  const normalizeChatData = useCallback((chat) => {
    return {
      ...chat,
      other_user_profile: normalizeUserProfile(chat.other_user_profile)
    };
  }, [normalizeUserProfile]);

  // Загрузка списка чатов
  const loadChatRooms = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      console.log('📥 Loading chat rooms...');
      const response = await chatAPI.getChatRooms();
      const normalizedChats = response.data.map(normalizeChatData);
      console.log('✅ Chat rooms loaded:', normalizedChats);
      setChatRooms(normalizedChats);
      setError('');
    } catch (error) {
      console.error('❌ Error loading chat rooms:', error);
      setError('Не удалось загрузить чаты');
    } finally {
      setLoading(false);
    }
  }, [user, normalizeChatData]);

  // Оптимизированная загрузка чатов с debounce
  const debouncedLoadChats = useCallback(
    debounce(loadChatRooms, 500),
    [loadChatRooms]
  );

  // Загрузка сообщений
  const loadMessages = useCallback(async (chatRoomId) => {
    if (!chatRoomId) return;

    try {
      console.log(`📥 Loading messages for chat ${chatRoomId}...`);
      const response = await chatAPI.getMessages(chatRoomId);
      console.log('✅ Messages loaded:', response.data);
      setMessages(response.data);
      setError('');
    } catch (error) {
      console.error('❌ Error loading messages:', error);
      setError('Не удалось загрузить сообщения');
    }
  }, []);

  // Отправка сообщения
  const sendMessage = async (messageContent) => {
    if (!selectedChat || !messageContent.trim()) {
      console.error('No selected chat or empty message');
      return;
    }

    const content = messageContent.trim();
    const tempId = `temp-${Date.now()}`;

    try {
      // Оптимистичное обновление UI
      const tempMessage = {
        id: tempId,
        content: content,
        sender: user.id,
        timestamp: new Date().toISOString(),
        isSending: true,
        sender_profile: {
          id: user.id,
          username: user.username,
          first_name: user.first_name
        }
      };

      setMessages(prev => [...prev, tempMessage]);

      // Пытаемся отправить через WebSocket
      const wsSent = WebSocketService.sendMessage(content);

      if (!wsSent) {
        // Fallback: отправка через REST API
        console.log('🔄 WebSocket not available, using REST API');
        await chatAPI.sendMessage(selectedChat.id, { content: content });
      }

      // Обновляем сообщения с сервера
      await loadMessages(selectedChat.id);
      debouncedLoadChats();

    } catch (error) {
      console.error('❌ Error sending message:', error);
      setError('Не удалось отправить сообщение');
      // Удаляем временное сообщение при ошибке
      setMessages(prev => prev.filter(msg => msg.id !== tempId));
    }
  };

  // Обработчик входящих WebSocket сообщений
  const handleWebSocketMessage = useCallback((data) => {
    console.log('🔄 WebSocket message handler called:', data);

    if (data.type === 'connection_status') {
      setConnectionStatus(data.connected ? 'connected' : 'disconnected');
      return;
    }

    if (data.message && selectedChat) {
      const newMessage = {
        id: data.message_id || `ws-${Date.now()}`,
        content: data.message,
        sender: data.user_id,
        timestamp: data.timestamp || new Date().toISOString(),
        username: data.username,
        is_read: false
      };

      setMessages(prev => {
        // Проверяем, нет ли уже такого сообщения
        const exists = prev.some(msg =>
          msg.id === newMessage.id ||
          (msg.content === newMessage.content && msg.sender === newMessage.sender)
        );

        if (!exists) {
          return [...prev, newMessage];
        }
        return prev;
      });

      // Обновляем список чатов
      debouncedLoadChats();
    }
  }, [selectedChat, debouncedLoadChats]);

  // Функция для создания учебной сессии
  const handleCreateSession = async (partnerUser) => {
    try {
      console.log('🎯 Creating session with user:', partnerUser);

      const sessionData = {
        title: `Совместная сессия с ${partnerUser.first_name || partnerUser.username}`,
        description: `Учебная сессия с ${partnerUser.first_name || partnerUser.username}. Давайте вместе позанимаемся!`,
        subject_name: 'Совместное обучение',
        scheduled_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        duration_minutes: 60,
        max_participants: 2
      };

      const response = await studySessionsAPI.createSession(sessionData);
      const newSession = response.data;

      console.log('✅ Session created:', newSession);

      // Отправляем приглашение
      await studySessionsAPI.sendInvitation(newSession.id, partnerUser.id);

      // Отправляем сообщение в чат о создании сессии
      const invitationMessage = `📚 Я создал(а) учебную сессию "${newSession.title}"! Присоединяйтесь!`;
      await sendMessage(invitationMessage);

    } catch (error) {
      console.error('❌ Error creating session:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.detail || error.message;
      alert(`Ошибка при создании сессии: ${errorMessage}`);
    }
  };

  // Прокрутка к последнему сообщению
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end"
    });
  };

  // Обработчик выбора чата
  const handleChatSelect = useCallback((chat) => {
    const normalizedChat = normalizeChatData(chat);
    setSelectedChat(normalizedChat);
    setMessages([]); // Очищаем сообщения перед загрузкой новых

    // Подключаемся к WebSocket для выбранного чата
    if (normalizedChat.id) {
      console.log(`🔗 Connecting to chat room: ${normalizedChat.id}`);
      WebSocketService.connect(normalizedChat.id);
    }

    loadMessages(normalizedChat.id);
  }, [normalizeChatData, loadMessages]);

  // Получение информации о партнере по чату
  const getPartnerInfo = useCallback((chat) => {
    if (!chat?.other_user_profile) {
      return {
        initials: '?',
        name: 'Загрузка...',
        faculty: 'Факультет не указан'
      };
    }

    const profile = chat.other_user_profile;
    return {
      initials: (profile.first_name?.charAt(0) || profile.username?.charAt(0) || '?').toUpperCase(),
      name: profile.first_name || profile.username || 'Неизвестный',
      faculty: profile.faculty || 'Факультет не указан',
      fullProfile: profile
    };
  }, []);

  const partnerInfo = selectedChat ? getPartnerInfo(selectedChat) : null;

  // Инициализация при загрузке компонента
  useEffect(() => {
    if (user) {
      loadChatRooms();

      // Регистрируем обработчик WebSocket сообщений
      WebSocketService.onMessage(handleWebSocketMessage);
    }

    return () => {
      // Очистка при размонтировании компонента
      WebSocketService.removeMessageCallback(handleWebSocketMessage);
      WebSocketService.disconnect();
      debouncedLoadChats.cancel();
    };
  }, [user, loadChatRooms, handleWebSocketMessage, debouncedLoadChats]);

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
            <div className="connection-status">
              <span className={`status-indicator ${connectionStatus}`}>
                {connectionStatus === 'connected' ? '🟢' : '🔴'}
              </span>
            </div>
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
              <div className="loading">
                <div className="spinner"></div>
                <p>Загрузка чатов...</p>
              </div>
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
                <button
                  onClick={() => navigate('/matching')}
                  className="find-partners-btn"
                >
                  Найти партнеров
                </button>
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

              <MessageList
                messages={messages}
                currentUser={user}
                otherUserProfile={partnerInfo.fullProfile}
                onCreateSession={handleCreateSession}
              />

              <MessageInput
                onSendMessage={sendMessage}
                onCreateSession={handleCreateSession}
                otherUser={partnerInfo.fullProfile}
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