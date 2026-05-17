require('dotenv').config();
const express = require('express');
const cors = require('cors');
const couponRoutes = require('./routes/coupons');
const dashboardRoutes = require('./routes/dashboard');
const authRoutes = require('./routes/auth');
const financeRoutes = require('./routes/finance');
const { verifyToken, requireAdmin, requireScanner } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware - CORS configuration
const corsOptions = {
  origin: function(origin, callback) {
    // Allow all origins in development
    if (process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',');
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  }
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Public Routes
app.use('/api/auth', authRoutes);

// Protected Routes
app.use('/api/coupons', verifyToken, couponRoutes);
app.use('/api/dashboard', verifyToken, dashboardRoutes);
app.use('/api/finance', verifyToken, financeRoutes);

// Health check (no auth required)
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`✓ Server running on http://localhost:${PORT}`);
});

module.exports = app;
