import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import { mkdirSync } from 'fs';
import { join } from 'path';

import positionsRouter from './routes/positions';
import { DatabaseManager } from './models/database';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;

// Create data directory if it doesn't exist
const dataDir = join(__dirname, '../data');
try {
  mkdirSync(dataDir, { recursive: true });
} catch (error) {
  // Directory already exists
}

// Initialize database
DatabaseManager.getInstance();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Trust proxy for accurate IP detection
app.set('trust proxy', true);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'vartarvipavag-server'
  });
});

// API routes
app.use('/api/positions', positionsRouter);

// Socket.IO for real-time updates
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Global error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    success: false, 
    error: 'Internal server error' 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    error: 'Route not found' 
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    DatabaseManager.getInstance().close();
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    DatabaseManager.getInstance().close();
    process.exit(0);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Position API: http://localhost:${PORT}/api/positions`);
  console.log(`🔒 Write operations restricted to localhost only`);
  console.log(`💡 Health check: http://localhost:${PORT}/health`);
});

export { io }; 