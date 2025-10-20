import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { chatAPI, studySessionsAPI } from '../services/api';
import WebSocketService from '../services/websocket';
import ChatList from '../components/chat/ChatList';
import MessageList from '../components/chat/MessageList';
import MessageInput from '../components/chat/MessageInput';
import { useNavigate, useLocation } from 'react-router-dom';
import './Chat.css';

const Chat = () => {
  const { user, loading: authLoading } = useAuth(); // Получаем состояние загрузки
  const [chatRooms, setChatRooms] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [otherUserProfile, setOtherUserProfile] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Если перешли из взаимных лайков с выбранным чатом
    if (location.state?.selectedChat) {
      setSelectedChat(location.state.selectedChat);
    }

    // Загружаем чаты только если пользователь авторизован
    if (!authLoading && user) {
      loadChatRooms();
    }

    return () => {
      WebSocketService.disconnect();
    };
  }, [location, authLoading, user]); // Добавлены зависимости

  useEffect(() => {
    // Настраиваем WebSocket только когда выбран чат И пользователь загружен
    if (selectedChat && user && !authLoading) {
      loadMessages(selectedChat.id);
      setupWebSocket(selectedChat.id);
      setOtherUserProfile(selectedChat.other_user_profile);
    } else {
      WebSocketService.disconnect();
      setOtherUserProfile(null);
    }
  }, [selectedChat, user, authLoading]);

  const setupWebSocket = (chatRoomId) => {
    WebSocketService.disconnect();

    if (user && user.username) {
      WebSocketService.connect(chatRoomId, user.username);
      WebSocketService.onMessage(handleNewMessage);
    }
  };

  const handleNewMessage = (messageData) => {
    if (!selectedChat || !user) return;

    const newMessage = {
      id: Date.now(),
      sender: messageData.username === user.username ? user.id : selectedChat.other_user,
      content: messageData.message,
      timestamp: new Date().toISOString(),
      is_read: messageData.username === user.username
    };

    setMessages(prev => [...prev, newMessage]);

    // Обновляем список чатов (последнее сообщение)
    setChatRooms(prev => prev.map(chat =>
      chat.id === selectedChat.id
        ? { ...chat, last_message: newMessage }
        : chat
    ));
  };

  const loadChatRooms = async () => {
    try {
      setLoading(true);
      const response = await chatAPI.getChatRooms();
      setChatRooms(response.data);
    } catch (error) {
      console.error('Ошибка загрузки чатов:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (chatRoomId) => {
    try {
      const response = await chatAPI.getMessages(chatRoomId);
      setMessages(response.data);
    } catch (error) {
      console.error('Ошибка загрузки сообщений:', error);
    }
  };

  const sendMessage = async (content) => {
    if (!selectedChat || !content.trim() || !user) return;

    const sent = WebSocketService.sendMessage(content);

    if (!sent) {
      try {
        await chatAPI.sendMessage(selectedChat.id, { content });
        loadMessages(selectedChat.id);
      } catch (error) {
        console.error('Ошибка отправки сообщения:', error);
      }
    }
  };

  const handleCreateSession = async (userProfile) => {
    if (!userProfile || !user) return;

    try {
      const sessionData = {
        title: `Сессия с ${userProfile.first_name || userProfile.username}`,
        description: `Совместная учебная сессия с ${userProfile.first_name || userProfile.username}`,
        subject_name: 'Общая подготовка',
        scheduled_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        duration_minutes: 60,
        max_participants: 2
      };

      const response = await studySessionsAPI.createSession(sessionData);
      const newSession = response.data;

      const sessionMessage = `📚 Предлагаю создать учебную сессию! "${newSession.title}" на ${new Date(newSession.scheduled_time).toLocaleDateString()}`;
      await sendMessage(sessionMessage);

      alert(`Сессия "${newSession.title}" создана! Сообщение отправлено собеседнику.`);

    } catch (error) {
      console.error('Ошибка создания сессии:', error);
      alert('Ошибка при создании сессии');
    }
  };

  const handleQuickSession = () => {
    if (!otherUserProfile || !user) return;

    const quickSessionMessage = `🎯 Предлагаю быстро собраться на учебную сессию! Есть время позаниматься?`;
    sendMessage(quickSessionMessage);
  };

  // Показываем загрузку пока проверяется аутентификация
  if (authLoading) {
    return (
      <div className="chat-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Проверка авторизации...</p>
        </div>
      </div>
    );
  }

  // Показываем сообщение если пользователь не авторизован
  if (!user) {
    return (
      <div className="chat-container">
        <div className="auth-required">
          <h2>Пожалуйста, войдите в систему</h2>
          <p>Для доступа к чату необходимо авторизоваться</p>
          <button
            onClick={() => navigate('/login')}
            className="login-btn"
          >
            Войти
          </button>
        </div>
      </div>
    );
  }

  // Показываем загрузку чатов
  if (loading) {
    return (
      <div className="chat-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Загрузка чатов...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-page">
      <div className="chat-container">
        <ChatList
          chatRooms={chatRooms}
          selectedChat={selectedChat}
          onSelectChat={setSelectedChat}
        />

        <div className="chat-main">
          {selectedChat ? (
            <>
              <div className="chat-header">
                <div className="chat-header-info">
                  <h3>
                    {otherUserProfile?.first_name && otherUserProfile?.last_name
                      ? `${otherUserProfile.first_name} ${otherUserProfile.last_name}`
                      : otherUserProfile?.username || 'Пользователь'
                    }
                  </h3>
                  <span className="chat-status">
                    {otherUserProfile?.faculty}
                    <span className="online-status">● онлайн</span>
                  </span>
                </div>
                <div className="chat-header-actions">
                  <button
                    className="quick-session-btn"
                    onClick={handleQuickSession}
                    title="Предложить быструю сессию"
                  >
                    🎯 Быстрая сессия
                  </button>
                </div>
              </div>

              <MessageList
                messages={messages}
                currentUser={user}
                otherUserProfile={otherUserProfile}
                onCreateSession={handleCreateSession}
              />

              <MessageInput
                onSendMessage={sendMessage}
                onCreateSession={handleCreateSession}
                otherUser={otherUserProfile}
              />
            </>
          ) : (
            <div className="chat-placeholder">
              <div className="placeholder-icon">💬</div>
              <h3>Выберите чат для начала общения</h3>
              <p>Начните общение с пользователями из раздела "Взаимные лайки"</p>
              <div className="placeholder-features">
                <div className="feature">💕 Взаимные лайки</div>
                <div className="feature">📚 Совместные сессии</div>
                <div className="feature">🎯 Быстрое планирование</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;