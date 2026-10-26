import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http'; // <-- NEW: Built-in Node module
import { Server } from 'socket.io'; // <-- NEW: Socket.IO
import requestRoutes from './routes/requestRoutes.js';
import authRoutes from './routes/authRoutes.js';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// Load environment variables from .env file
dotenv.config();

const app = express();

// --- NEW WEBSOCKET SETUP ---
// 1. Create HTTP server using Express app
const server = http.createServer(app);

// 2. Initialize Socket.IO with CORS settings
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Your React frontend URL
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// 3. Make 'io' accessible inside your controllers
app.set('io', io);

// 4. Listen for connections
io.on('connection', (socket) => {
  console.log(`🔌 New client connected: ${socket.id}`);
  
  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});
// ---------------------------

// Middleware
app.use(cors()); 
app.use(express.json()); 

/* Experiment 5 – Security hardening */
app.use(helmet());                         // Sets secure HTTP headers

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,               // 15 minutes
  max: 100,                                 // limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' },
});
app.use('/api', limiter);

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected Successfully'))
  .catch((err) => console.log('❌ MongoDB Connection Failed:', err.message));

// API Routes
app.use('/api/requests', requestRoutes);
app.use('/api/auth', authRoutes);

/* Global error handler */
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
});

// Start Server
const PORT = process.env.PORT || 5000;

// IMPORTANT: Changed app.listen to server.listen
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT} with WebSockets enabled`);
});