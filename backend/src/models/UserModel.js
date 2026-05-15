const pool = require('../database/config');
const bcrypt = require('bcrypt');

class UserModel {
  // Get user by username
  static async getByUsername(username) {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.execute(
        'SELECT * FROM users WHERE username = ?',
        [username]
      );
      return rows[0] || null;
    } finally {
      conn.release();
    }
  }

  // Get user by email
  static async getByEmail(email) {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.execute(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );
      return rows[0] || null;
    } finally {
      conn.release();
    }
  }

  // Get user by ID
  static async getById(id) {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.execute(
        'SELECT id, username, email, role, is_active, last_login, created_at FROM users WHERE id = ?',
        [id]
      );
      return rows[0] || null;
    } finally {
      conn.release();
    }
  }

  // Verify password
  static async verifyPassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  // Create new user
  static async create(username, email, password, role = 'scanner') {
    const conn = await pool.getConnection();
    try {
      const passwordHash = await bcrypt.hash(password, 10);
      
      const [result] = await conn.execute(
        'INSERT INTO users (username, email, password_hash, role, is_active) VALUES (?, ?, ?, ?, ?)',
        [username, email, passwordHash, role, true]
      );

      return await this.getById(result.insertId);
    } finally {
      conn.release();
    }
  }

  // Update last login
  static async updateLastLogin(id) {
    const conn = await pool.getConnection();
    try {
      await conn.execute(
        'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
        [id]
      );
    } finally {
      conn.release();
    }
  }

  // Get all users
  static async getAll() {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.execute(
        'SELECT id, username, email, role, is_active, last_login, created_at FROM users ORDER BY created_at DESC'
      );
      return rows;
    } finally {
      conn.release();
    }
  }

  // Deactivate user
  static async deactivate(id) {
    const conn = await pool.getConnection();
    try {
      const [result] = await conn.execute(
        'UPDATE users SET is_active = FALSE WHERE id = ?',
        [id]
      );
      return result.affectedRows > 0;
    } finally {
      conn.release();
    }
  }

  // Change password
  static async changePassword(id, newPassword) {
    const conn = await pool.getConnection();
    try {
      const passwordHash = await bcrypt.hash(newPassword, 10);
      const [result] = await conn.execute(
        'UPDATE users SET password_hash = ? WHERE id = ?',
        [passwordHash, id]
      );
      return result.affectedRows > 0;
    } finally {
      conn.release();
    }
  }
}

module.exports = UserModel;
