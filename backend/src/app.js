require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const messageRoutes = require('./routes/messages');
const analysisRoutes = require('./routes/analyses');
const adminRoutes = require('./routes/admin');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '../../public')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/analyses', analysisRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint for API
app.get('/api', (req, res) => res.json({
  ok: true,
  service: 'antiphish-backend',
  version: '1.0.0',
  timestamp: new Date().toISOString()
}));

// API 404 handler (before SPA fallback)
app.use('/api/*', notFoundHandler);

// Serve index.html for all other routes (SPA fallback)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../public/index.html'));
});

// Global error handler (must be last)
app.use(errorHandler);

module.exports = app;