const express = require('express');
const AuthController = require('../controllers/AuthController');
const { verifyToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/login', AuthController.login);
router.post('/register', AuthController.register);
router.post('/verify-token', AuthController.verifyToken);

// Protected routes
router.get('/profile', verifyToken, AuthController.getProfile);
router.post('/change-password', verifyToken, AuthController.changePassword);

// Admin routes
router.get('/users', verifyToken, requireAdmin, AuthController.listUsers);
router.post('/users/:userId/deactivate', verifyToken, requireAdmin, AuthController.deactivateUser);

module.exports = router;
