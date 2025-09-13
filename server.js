import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.development.local' });

// Import routes
import healthRoutes from './server/routes/health.js';
import usersRoutes from './server/routes/users.js';
import notificationsRoutes from './server/routes/notifications.js';
import seedRoutes from './server/routes/seed.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS for all routes
app.use(morgan('combined')); // Logging
app.use(express.json({ limit: '10mb' })); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// API Routes (with /api prefix for Vercel compatibility)
app.use('/api/health', healthRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/seed', seedRoutes);

// Additional routes without /api prefix for local development compatibility
app.use('/health', healthRoutes);
app.use('/users', usersRoutes);
app.use('/notifications', notificationsRoutes);
app.use('/seed', seedRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'User Lens API Server',
    version: '1.0.0',
    endpoints: {
      health: '/api/health or /health',
      users: '/api/users or /users',
      notifications: '/api/notifications or /notifications',
      seed: '/api/seed or /seed'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.url} not found`
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
  console.log(`👥 Users API: http://localhost:${PORT}/api/users`);
  console.log(`🔔 Notifications: http://localhost:${PORT}/api/notifications`);
  console.log(`🌱 Seed data: http://localhost:${PORT}/api/seed`);
});

export default app;
