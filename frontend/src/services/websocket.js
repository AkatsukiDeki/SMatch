class WebSocketService {
  constructor() {
    this.socket = null;
    this.messageCallbacks = [];
  }

  connect(chatRoomId, username) {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return false;

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws/chat/${chatRoomId}/`;

      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        console.log('WebSocket connected');
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.messageCallbacks.forEach(callback => callback(data));
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      };

      this.socket.onclose = () => {
        console.log('WebSocket disconnected');
      };

      return true;
    } catch (error) {
      console.error('WebSocket connection failed:', error);
      return false;
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  sendMessage(message) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ message }));
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