const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const socketIO = require('socket.io');



// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const driverRoutes = require('./routes/driverRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');



// Import socket configuration
const configureSocket = require('./config/socket');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "https://rentngo.onrender.com",  // Frontend URL
    credentials: true
  }
});

// Middleware - Update CORS to accept requests from frontend on port 3000
app.use(cors({
  origin: "https://rentngo.onrender.com",  // This should be your frontend URL
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add a test route
app.get('/', (req, res) => {
  res.json({ message: 'API is running' });
});

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/travel-booking', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

// Configure socket.io
configureSocket(io);

// Make io accessible to routes
app.set('io', io);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
