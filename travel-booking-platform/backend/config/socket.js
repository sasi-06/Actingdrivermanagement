// Socket.IO configuration for real-time notifications
const jwt = require('jsonwebtoken');

const configureSocket = (io) => {
  // Store user socket connections
  const userSockets = new Map();
  const driverSockets = new Map();
  const adminSockets = new Map();

  // Make socket utilities available globally
  global.socketUtils = {
    io,
    userSockets,
    driverSockets,
    adminSockets,
    notifyDriver: (driverId, event, data) => {
      const socketId = driverSockets.get(driverId.toString());
      if (socketId) {
        io.to(socketId).emit(event, data);
      }
    },
    notifyUser: (userId, event, data) => {
      const socketId = userSockets.get(userId.toString());
      if (socketId) {
        io.to(socketId).emit(event, data);
      }
    },
    notifyAllDrivers: (event, data) => {
      // Emit to all connected sockets
      io.emit(event, data);
    }
  };

  io.on('connection', (socket) => {
    console.log('New socket connection:', socket.id);

    // Authenticate socket connection
    socket.on('authenticate', async (token) => {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.userId;
        socket.userRole = decoded.role;

        // Store socket connection based on role
        if (decoded.role === 'user') {
          userSockets.set(decoded.userId, socket.id);
          console.log(`User ${decoded.userId} connected`);
        } else if (decoded.role === 'driver') {
          driverSockets.set(decoded.userId, socket.id);
          console.log(`Driver ${decoded.userId} connected`);
        } else if (decoded.role === 'admin') {
          adminSockets.set(decoded.userId, socket.id);
          console.log(`Admin ${decoded.userId} connected`);
        }

        socket.emit('authenticated', { userId: decoded.userId, role: decoded.role });
      } catch (error) {
        console.error('Socket auth error:', error);
        socket.emit('auth_error', 'Invalid token');
      }
    });

    // Handle driver location updates
    socket.on('update_location', (data) => {
      if (socket.userRole === 'driver') {
        socket.broadcast.emit('driver_location_update', {
          driverId: socket.userId,
          location: data.location
        });
      }
    });

    // Handle chat messages
    socket.on('send_message', (data) => {
      const { recipientId, message } = data;
      const recipientSocketId = userSockets.get(recipientId) || driverSockets.get(recipientId);
      
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('new_message', {
          senderId: socket.userId,
          message: message,
          timestamp: new Date()
        });
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      if (socket.userId) {
        userSockets.delete(socket.userId);
        driverSockets.delete(socket.userId);
        adminSockets.delete(socket.userId);
        console.log(`User ${socket.userId} disconnected`);
      }
    });
  });
};

module.exports = configureSocket;
