import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import requestRoutes from './routes/requestRoutes.js';
import authRoutes from './routes/authRoutes.js';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

const app = express();

// --- WEBSOCKET SETUP ---
const server = http.createServer(app);

// Allowed origins for CORS (localhost + deployed frontend)
const allowedOrigins = [
  'http://localhost:5173',
  'https://local-service-platform-steel.vercel.app',
  process.env.CLIENT_URL,
].filter(Boolean);

// Initialize Socket.IO with CORS settings
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// Make 'io' accessible inside controllers
app.set('io', io);

io.on('connection', (socket) => {
  console.log(`🔌 New client connected: ${socket.id}`);
  
  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

app.set('trust proxy', 1);
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json()); 

/* Experiment 5 – Security hardening */
app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 2000, // Generous limit so local dev and testing never get choked
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
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

server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT} with WebSockets enabled`);
});
