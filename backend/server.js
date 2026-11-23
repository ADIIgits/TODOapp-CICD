const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const todosRoute = require('./routes/todos');
const analyticsRoute = require('./routes/analytics');

const app = express();
const PORT = process.env.PORT || 5001;

// CORS configuration (allow frontend origin or all during development/production)
const allowedOrigins = process.env.CLIENT_ORIGIN
  ? process.env.CLIENT_ORIGIN.split(',').map((o) => o.trim())
  : '*';

app.use(
  cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    dbConnected: mongoose.connection.readyState === 1,
  });
});

// API Routes
app.use('/api/todos', todosRoute);
app.use('/api/analytics', analyticsRoute);

// Welcome / Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the Todo & Goal Tracker API',
    endpoints: {
      todos: '/api/todos (GET ?date=YYYY-MM-DD, POST, PUT /:id, DELETE /:id)',
      analytics: '/api/analytics (GET)',
      health: '/health',
    },
  });
});

// MongoDB Atlas Connection
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.warn('⚠️ WARNING: MONGODB_URI is not defined in environment variables. Please provide your MongoDB Atlas URI in .env.');
}

const connectDB = async () => {
  try {
    if (MONGODB_URI) {
      await mongoose.connect(MONGODB_URI);
      console.log(' Successfully connected to MongoDB Atlas');
    } else {
      console.log('ℹ️ Running in disconnected mode. Set MONGODB_URI to connect to MongoDB Atlas.');
    }
  } catch (err) {
    console.error('❌ MongoDB Atlas connection error:', err.message);
  }
};

connectDB();

app.listen(PORT, () => {
  console.log(` Todo App Backend listening on port ${PORT}`);
});

module.exports = app;
