require('dotenv').config();
const express = require('express');
const cors = require('cors');
const couponRoutes = require('./routes/coupons');
const dashboardRoutes = require('./routes/dashboard');
const authRoutes = require('./routes/auth');
const { verifyToken, requireAdmin, requireScanner } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173'
}));
app.use(express.json());
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Public Routes
app.use('/api/auth', authRoutes);

// Protected Routes
app.use('/api/coupons', verifyToken, couponRoutes);
app.use('/api/dashboard', verifyToken, dashboardRoutes);

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
