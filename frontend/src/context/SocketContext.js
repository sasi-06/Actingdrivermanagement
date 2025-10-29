// Socket context for real-time communication
import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const { user, token } = useAuth();

  useEffect(() => {
    if (user && token) {
      console.log('Initializing socket connection for user:', user.id, user.role);
      
      // Initialize socket connection
      const newSocket = io('https://actingdrivermanagement.onrender.com', {
        transports: ['websocket', 'polling'],
        auth: { token },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      newSocket.on('connect', () => {
        console.log('Socket connected successfully');
        setConnected(true);
        // Send authentication immediately after connection
        newSocket.emit('authenticate', token);
      });

      newSocket.on('authenticated', (data) => {
        console.log('Socket authenticated:', data);
      });

      newSocket.on('auth_error', (error) => {
        console.error('Socket auth error:', error);
      });

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected');
        setConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error.message);
      });

      // Handle notifications based on user role
      if (user.role === 'driver') {
        newSocket.on('new_booking_request', (data) => {
          console.log('New booking request received:', data);
          toast.info('New booking request available!');
          // Force refresh of new requests component
          window.dispatchEvent(new Event('new_booking_available'));
        });
      }

      if (user.role === 'user') {
        newSocket.on(`booking_accepted_${user.id}`, (data) => {
          toast.success('Your booking has been accepted!');
        });

        newSocket.on(`trip_started_${user.id}`, (data) => {
          toast.info('Your trip has started!');
        });

        newSocket.on(`trip_completed_${user.id}`, (data) => {
          toast.success('Your trip has been completed!');
        });
      }

      // Common events
      newSocket.on(`booking_cancelled_${user.id}`, (data) => {
        toast.warning(`Booking cancelled`);
      });

      setSocket(newSocket);

      return () => {
        console.log('Cleaning up socket connection');
        newSocket.close();
      };
    } else {
      console.log('No user or token, skipping socket connection');
    }
  }, [user, token]);

  const emit = (event, data) => {
    if (socket && connected) {
      console.log('Emitting event:', event, data);
      socket.emit(event, data);
    } else {
      console.warn('Socket not connected, cannot emit event:', event);
    }
  };

  const on = (event, callback) => {
    if (socket) {
      socket.on(event, callback);
    }
  };

  const off = (event, callback) => {
    if (socket) {
      socket.off(event, callback);
    }
  };

  const value = {
    socket,
    connected,
    emit,
    on,
    off
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
