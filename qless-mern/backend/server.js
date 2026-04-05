require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173', // React frontend URL
    methods: ['GET', 'POST'],
  },
});

// Make io accessible in controllers via app
app.set('io', io);

// Middleware
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/services', require('./routes/serviceRoutes'));
app.use('/api/queue', require('./routes/queueRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'QLess API is running 🚀' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Server Error', error: err.message });
});

// Socket.IO events
io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);

  // Client joins a "room" for a specific service's queue
  socket.on('joinServiceRoom', (serviceId) => {
    socket.join(`service_${serviceId}`);
    console.log(`Socket ${socket.id} joined room service_${serviceId}`);
  });

  socket.on('leaveServiceRoom', (serviceId) => {
    socket.leave(`service_${serviceId}`);
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 QLess Server running on http://localhost:${PORT}`);
});
