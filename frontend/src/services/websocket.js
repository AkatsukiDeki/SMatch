class EnhancedWebSocketService {
  constructor() {
    this.socket = null;
    this.messageCallbacks = new Set();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 8;
    this.reconnectInterval = 2000;
    this.currentChatRoomId = null;
    this.isConnected = false;
    this.pendingMessages = [];
    this.lastMessageId = 0;
    this.connectionCallbacks = new Set();
  }

  connect(chatRoomId) {
    return new Promise((resolve, reject) => {
      try {
        if (this.socket) {
          this.disconnect();
        }

        const token = localStorage.getItem('access_token');
        if (!token) {
          reject(new Error('No access token found'));
          return;
        }

        this.currentChatRoomId = chatRoomId;

        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/ws/chat/${chatRoomId}/`;

        console.log(`🔗 Connecting to WebSocket: ${wsUrl}`);

        this.socket = new WebSocket(wsUrl);

        this.socket.onopen = () => {
          console.log('✅ WebSocket connected successfully');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.notifyConnectionChange(true);

          // Отправляем ожидающие сообщения
          this.flushPendingMessages();

          resolve(true);
        };

        this.socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log('📨 WebSocket message received:', data);
            this.handleIncomingMessage(data);
          } catch (error) {
            console.error('❌ Error parsing WebSocket message:', error);
          }
        };

        this.socket.onerror = (error) => {
          console.error('❌ WebSocket error:', error);
          this.isConnected = false;
          this.notifyConnectionChange(false);
          reject(error);
        };

        this.socket.onclose = (event) => {
          console.log(`🔌 WebSocket disconnected: ${event.code} - ${event.reason}`);
          this.isConnected = false;
          this.notifyConnectionChange(false);

          if (!event.wasClean && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.handleReconnection();
          }
        };

      } catch (error) {
        console.error('❌ WebSocket connection failed:', error);
        reject(error);
      }
    });
  }

  handleIncomingMessage(data) {
    // Обрабатываем разные типы сообщений
    if (data.type === 'message') {
      this.messageCallbacks.forEach(callback => {
        try {
          callback({
            type: 'message',
            id: data.id,
            content: data.content,
            sender: data.sender,
            timestamp: data.timestamp,
            username: data.username,
            chat_room: data.chat_room
          });
        } catch (error) {
          console.error('Error in message callback:', error);
        }
      });
    } else if (data.type === 'typing') {
      this.messageCallbacks.forEach(callback => {
        try {
          callback({
            type: 'typing',
            user_id: data.user_id,
            username: data.username,
            is_typing: data.is_typing
          });
        } catch (error) {
          console.error('Error in typing callback:', error);
        }
      });
    } else if (data.type === 'user_online') {
      this.messageCallbacks.forEach(callback => {
        try {
          callback({
            type: 'user_status',
            user_id: data.user_id,
            username: data.username,
            is_online: data.is_online,
            last_seen: data.last_seen
          });
        } catch (error) {
          console.error('Error in status callback:', error);
        }
      });
    } else {
      // Стандартное сообщение
      this.messageCallbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in generic callback:', error);
        }
      });
    }
  }

  async sendMessage(message, options = {}) {
    const messageId = ++this.lastMessageId;
    const messageData = {
      id: messageId,
      message: message,
      timestamp: new Date().toISOString(),
      type: 'message',
      ...options
    };

    if (!this.isConnected || !this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.log('💾 Queueing message (offline):', messageData);
      this.pendingMessages.push(messageData);
      return { queued: true, id: messageId };
    }

    try {
      this.socket.send(JSON.stringify(messageData));
      console.log('✅ Message sent via WebSocket:', messageData);
      return { sent: true, id: messageId };
    } catch (error) {
      console.error('❌ Error sending message via WebSocket:', error);
      this.pendingMessages.push(messageData);
      return { queued: true, id: messageId, error: error.message };
    }
  }

  sendTypingIndicator(isTyping) {
    if (this.isConnected && this.socket && this.socket.readyState === WebSocket.OPEN) {
      const typingData = {
        type: 'typing',
        is_typing: isTyping,
        timestamp: new Date().toISOString()
      };

      this.socket.send(JSON.stringify(typingData));
    }
  }

  flushPendingMessages() {
    if (this.pendingMessages.length > 0 && this.isConnected) {
      console.log(`🔄 Flushing ${this.pendingMessages.length} pending messages`);

      this.pendingMessages.forEach(message => {
        try {
          this.socket.send(JSON.stringify(message));
        } catch (error) {
          console.error('Error flushing pending message:', error);
        }
      });

      this.pendingMessages = [];
    }
  }

  handleReconnection() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(this.reconnectInterval * this.reconnectAttempts, 30000);

      console.log(`🔄 Attempting reconnect ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);

      setTimeout(() => {
        if (this.currentChatRoomId) {
          this.connect(this.currentChatRoomId).catch(error => {
            console.error('Reconnection failed:', error);
          });
        }
      }, delay);
    } else {
      console.error('❌ Max reconnection attempts reached');
      this.notifyConnectionChange(false, 'max_attempts_reached');
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.close(1000, 'Manual disconnect');
      this.socket = null;
    }
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.pendingMessages = [];
    console.log('🔌 WebSocket manually disconnected');
  }

  onMessage(callback) {
    this.messageCallbacks.add(callback);

    // Возвращаем функцию для удаления
    return () => {
      this.messageCallbacks.delete(callback);
    };
  }

  onConnectionChange(callback) {
    this.connectionCallbacks.add(callback);

    return () => {
      this.connectionCallbacks.delete(callback);
    };
  }

  notifyConnectionChange(connected, reason = '') {
    this.connectionCallbacks.forEach(callback => {
      try {
        callback({ connected, reason, timestamp: new Date().toISOString() });
      } catch (error) {
        console.error('Error in connection callback:', error);
      }
    });
  }

  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      maxReconnectAttempts: this.maxReconnectAttempts,
      pendingMessages: this.pendingMessages.length
    };
  }

  getPendingMessagesCount() {
    return this.pendingMessages.length;
  }
}

export default new EnhancedWebSocketService();