const jwt = require('jsonwebtoken');
const UserModel = require('../models/UserModel');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRY = '24h';

class AuthController {
  // User login
  static async login(req, res) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required' });
      }

      const user = await UserModel.getByUsername(username);

      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      if (!user.is_active) {
        return res.status(401).json({ error: 'User account is inactive' });
      }

      const validPassword = await UserModel.verifyPassword(password, user.password_hash);

      if (!validPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Update last login
      await UserModel.updateLastLogin(user.id);

      // Generate JWT token
      const token = jwt.sign(
        {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRY }
      );

      res.json({
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Register new user (admin only)
  static async register(req, res) {
    try {
      const { username, email, password, role = 'scanner' } = req.body;

      if (!username || !email || !password) {
        return res.status(400).json({ error: 'Username, email, and password required' });
      }

      if (username.length < 3) {
        return res.status(400).json({ error: 'Username must be at least 3 characters' });
      }

      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
      }

      // Check if user already exists
      const existingUser = await UserModel.getByUsername(username);
      if (existingUser) {
        return res.status(409).json({ error: 'Username already exists' });
      }

      const existingEmail = await UserModel.getByEmail(email);
      if (existingEmail) {
        return res.status(409).json({ error: 'Email already registered' });
      }

      const newUser = await UserModel.create(username, email, password, role);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          role: newUser.role
        }
      });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Get current user profile
  static async getProfile(req, res) {
    try {
      const userId = req.user.id;
      const user = await UserModel.getById(userId);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Change password
  static async changePassword(req, res) {
    try {
      const { oldPassword, newPassword } = req.body;

      if (!oldPassword || !newPassword) {
        return res.status(400).json({ error: 'Old and new password required' });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ error: 'New password must be at least 6 characters' });
      }

      const user = await UserModel.getById(req.user.id);
      const validPassword = await UserModel.verifyPassword(oldPassword, user.password_hash);

      if (!validPassword) {
        return res.status(401).json({ error: 'Current password is incorrect' });
      }

      const changed = await UserModel.changePassword(req.user.id, newPassword);

      if (changed) {
        res.json({
          success: true,
          message: 'Password changed successfully'
        });
      } else {
        res.status(400).json({ error: 'Failed to change password' });
      }
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Verify password without changing anything (for sensitive admin actions)
  static async verifyPassword(req, res) {
    try {
      const { password } = req.body;

      if (!password) {
        return res.status(400).json({ error: 'Password is required' });
      }

      const user = await UserModel.getAuthById(req.user.id);

      if (!user || !user.is_active) {
        return res.status(401).json({ error: 'User not found or inactive' });
      }

      const validPassword = await UserModel.verifyPassword(password, user.password_hash);

      if (!validPassword) {
        return res.status(401).json({ error: 'Password is incorrect' });
      }

      res.json({
        success: true,
        message: 'Password verified successfully'
      });
    } catch (error) {
      console.error('Verify password error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // List all users (admin only)
  static async listUsers(req, res) {
    try {
      const users = await UserModel.getAll();
      res.json({
        success: true,
        data: users
      });
    } catch (error) {
      console.error('List users error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Deactivate user (admin only)
  static async deactivateUser(req, res) {
    try {
      const { userId } = req.params;

      if (userId == req.user.id) {
        return res.status(400).json({ error: 'Cannot deactivate yourself' });
      }

      const deactivated = await UserModel.deactivate(userId);

      if (deactivated) {
        res.json({
          success: true,
          message: 'User deactivated successfully'
        });
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    } catch (error) {
      console.error('Deactivate user error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Verify token
  static async verifyToken(req, res) {
    try {
      const token = req.headers.authorization?.split(' ')[1];

      if (!token) {
        return res.status(401).json({ error: 'No token provided' });
      }

      const decoded = jwt.verify(token, JWT_SECRET);
      res.json({
        success: true,
        user: decoded
      });
    } catch (error) {
      res.status(401).json({ error: 'Invalid token' });
    }
  }
}

module.exports = AuthController;
