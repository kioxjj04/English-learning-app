import express from 'express';
import cors from 'cors';
import os from 'os';
import { config } from './config/index.js';
import { initializeDatabase } from './database/schema.js';
import { apiRouter } from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger for debugging during development/defense
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${req.method}] ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// API Routes
app.use('/api', apiRouter);

// Global Error Handler
app.use(errorHandler);

// Helper function to get local LAN IP
function getLocalIpAddress(): string {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

async function startServer() {
  try {
    await initializeDatabase();

    const localIp = getLocalIpAddress();

    app.listen(config.port, '0.0.0.0', () => {
      console.log('====================================================');
      console.log(`🚀 EnglishGo Backend running on port ${config.port}`);
      console.log(`📱 Local machine access: http://localhost:${config.port}/api/health`);
      console.log(`📲 Physical Phone LAN access: http://${localIp}:${config.port}/api`);
      console.log('====================================================');
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();

