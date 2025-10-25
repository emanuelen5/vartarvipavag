import dotenv from 'dotenv';
import express from 'express';
import { mkdirSync } from 'fs';
import { createServer } from 'http';
import { join } from 'path';
import { Server } from 'socket.io';

import { DatabaseManager } from './models/database';
import positionsRouter from './routes/positions';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  // CORS is handled by nginx
  cors: {
    origin: false // Disable CORS handling in Socket.IO
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
// Note: CORS is handled by nginx, not by Express
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
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');

  server.close(() => {
    console.log('Server closed');
    DatabaseManager.getInstance().close();
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
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
