// Socket service for real-time features
import { io } from 'socket.io-client';

class SocketService {
  socket = null;

  connect(token) {
    // Determine backend/socket URL from env vars with sensible fallbacks
    const backendFromApi = process.env.REACT_APP_API_URL ? process.env.REACT_APP_API_URL.replace(/\/api\/?$/i, '') : null;
    const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || backendFromApi || 'https://actingdrivermanagement.onrender.com';

    this.socket = io(BACKEND_URL, {
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
