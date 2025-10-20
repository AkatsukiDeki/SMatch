// src/services/websocket.js - ОБНОВЛЕННАЯ ВЕРСИЯ
class WebSocketService {
  constructor() {
    this.socket = null;
    this.messageCallbacks = [];
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 3;
    this.reconnectDelay = 2000;
  }

  connect(chatRoomId, username) {
    if (this.socket) {
      this.disconnect();
    }

    try {
      // Используем правильный URL
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//127.0.0.1:8000/ws/chat/${chatRoomId}/`;

      console.log(`🔗 Connecting to WebSocket: ${wsUrl}`);

      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        console.log('✅ WebSocket connected successfully');
        this.reconnectAttempts = 0;
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('📨 WebSocket message received:', data);
          this.messageCallbacks.forEach(callback => callback(data));
        } catch (error) {
          console.error('❌ Error parsing WebSocket message:', error);
        }
      };

      this.socket.onclose = (event) => {
        console.log(`🔌 WebSocket disconnected: ${event.code} ${event.reason}`);

        // Попытка переподключения только для определенных кодов
        if (this.reconnectAttempts < this.maxReconnectAttempts &&
            event.code !== 1000 && // Normal closure
            event.code !== 1008) { // Policy violation

          setTimeout(() => {
            this.reconnectAttempts++;
            console.log(`🔄 Reconnecting... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            this.connect(chatRoomId, username);
          }, this.reconnectDelay * this.reconnectAttempts);
        }
      };

      this.socket.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
      };

      this.username = username;

    } catch (error) {
      console.error('❌ WebSocket connection failed:', error);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.close(1000, 'Normal closure');
      this.socket = null;
    }
  }

  sendMessage(message) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({
        message: message,
        username: this.username
      }));
      console.log('📤 Message sent via WebSocket:', message);
      return true;
    } else {
      console.warn('⚠️ WebSocket not connected, message not sent');
      return false;
    }
  }

  onMessage(callback) {
    this.messageCallbacks.push(callback);
  }

  removeMessageCallback(callback) {
    this.messageCallbacks = this.messageCallbacks.filter(cb => cb !== callback);
  }

  getConnectionState() {
    return this.socket ? this.socket.readyState : WebSocket.CLOSED;
  }
}

export default new WebSocketService();