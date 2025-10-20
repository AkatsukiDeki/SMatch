class WebSocketService {
  constructor() {
    this.socket = null;
    this.messageCallbacks = [];
  }

  connect(chatRoomId, username) {
    if (this.socket) {
      this.disconnect();
    }

    this.socket = new WebSocket(
      `ws://localhost:8000/ws/chat/${chatRoomId}/`
    );

    this.socket.onopen = () => {
      console.log('WebSocket connected');
    };

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.messageCallbacks.forEach(callback => callback(data));
    };

    this.socket.onclose = () => {
      console.log('WebSocket disconnected');
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.username = username;
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  sendMessage(message) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({
        message: message,
        username: this.username
      }));
      return true;
    }
    return false;
  }

  onMessage(callback) {
    this.messageCallbacks.push(callback);
  }

  removeMessageCallback(callback) {
    this.messageCallbacks = this.messageCallbacks.filter(cb => cb !== callback);
  }
}

export default new WebSocketService();