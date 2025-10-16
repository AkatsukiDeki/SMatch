// src/pages/Chat.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { chatAPI } from '../services/api';
import ChatList from '../components/chat/ChatList';
import MessageList from '../components/chat/MessageList';
import MessageInput from '../components/chat/MessageInput';
import './Chat.css';

const Chat = () => {
  const { user } = useAuth();
  const [chatRooms, setChatRooms] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChatRooms();
  }, []);

  useEffect(() => {
    if (selectedChat) {
      loadMessages(selectedChat.id);
      // Настроим интервал для обновления сообщений
      const interval = setInterval(() => {
        loadMessages(selectedChat.id);
      }, 3000); // Обновляем каждые 3 секунды

      return () => clearInterval(interval);
    }
  }, [selectedChat]);

  const loadChatRooms = async () => {
    try {
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
    if (!selectedChat || !content.trim()) return;

    try {
      await chatAPI.sendMessage(selectedChat.id, { content });
      loadMessages(selectedChat.id); // Обновляем сообщения после отправки
    } catch (error) {
      console.error('Ошибка отправки сообщения:', error);
    }
  };

  if (!user) {
    return <div className="chat-container">Пожалуйста, войдите в систему</div>;
  }

  if (loading) {
    return <div className="chat-container">Загрузка чатов...</div>;
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
                <h3>
                  Чат с {selectedChat.other_user_profile?.username || 'пользователем'}
                </h3>
                <span className="chat-status">
                  {selectedChat.other_user_profile?.faculty}
                </span>
              </div>

              <MessageList
                messages={messages}
                currentUser={user}
              />

              <MessageInput onSendMessage={sendMessage} />
            </>
          ) : (
            <div className="chat-placeholder">
              <h3>Выберите чат для начала общения</h3>
              <p>Здесь будут отображаться ваши сообщения</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;