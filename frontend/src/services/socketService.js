// Socket service for real-time features
import { io } from 'socket.io-client';

class SocketService {
  socket = null;

  connect(token) {
    this.socket = io('https://actingdrivermanagement.onrender.com', {
      auth: { token }
    });

    return new Promise((resolve, reject) => {
      this.socket.on('connect', () => {
        this.socket.emit('authenticate', token);
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        reject(error);
      });
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  emit(event, data) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event) {
    if (this.socket) {
      this.socket.off(event);
    }
  }
}

export default new SocketService();
