const pool = require('../database/config');
const crypto = require('crypto');

class CouponModel {
  // Generate QR Secret
  static generateQRSecret() {
    return crypto.randomBytes(16).toString('hex');
  }

  // Create multiple coupons
  static async createMultiple(count) {
    const conn = await pool.getConnection();
    try {
      // Get max no_urut
      const [result] = await conn.execute('SELECT MAX(no_urut) as max_no FROM coupons');
      const startNo = (result[0]?.max_no || 0) + 1;

      const coupons = [];
      for (let i = 0; i < count; i++) {
        const qr_secret = this.generateQRSecret();
        const no_urut = startNo + i;
        
        await conn.execute(
          'INSERT INTO coupons (qr_secret, no_urut, status) VALUES (?, ?, ?)',
          [qr_secret, no_urut, 'kosong']
        );
        
        coupons.push({ qr_secret, no_urut });
      }

      return coupons;
    } finally {
      conn.release();
    }
  }

  // Get coupon by QR secret
  static async getByCouponSecret(qr_secret) {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.execute(
        'SELECT * FROM coupons WHERE qr_secret = ?',
        [qr_secret]
      );
      return rows[0] || null;
    } finally {
      conn.release();
    }
  }

  // Register coupon (status kosong -> terdaftar)
  static async register(qr_secret, nama_penerima, rt, rw, alamat, photo_penerima = null) {
    const conn = await pool.getConnection();
    try {
      const [result] = await conn.execute(
        `UPDATE coupons 
         SET nama_penerima = ?, rt = ?, rw = ?, alamat = ?, photo_penerima = ?, status = 'terdaftar' 
         WHERE qr_secret = ? AND status = 'kosong'`,
        [nama_penerima, rt, rw, alamat, photo_penerima, qr_secret]
      );
      
      return result.affectedRows > 0;
    } finally {
      conn.release();
    }
  }

  // Confirm pickup (status terdaftar -> diambil)
  static async confirmPickup(qr_secret) {
    const conn = await pool.getConnection();
    try {
      const [result] = await conn.execute(
        `UPDATE coupons 
         SET status = 'diambil', waktu_ambil = CURRENT_TIMESTAMP 
         WHERE qr_secret = ? AND status = 'terdaftar'`,
        [qr_secret]
      );
      
      return result.affectedRows > 0;
    } finally {
      conn.release();
    }
  }

  // Get all coupons
  static async getAll(limit = 100, offset = 0) {
    const conn = await pool.getConnection();
    try {
      // Ensure limit and offset are integers
      limit = parseInt(limit) || 100;
      offset = parseInt(offset) || 0;
      
      const [rows] = await conn.execute(
        `SELECT * FROM coupons ORDER BY no_urut ASC LIMIT ${limit} OFFSET ${offset}`
      );
      const [countResult] = await conn.execute('SELECT COUNT(*) as total FROM coupons');
      return {
        data: rows,
        total: countResult[0].total
      };
    } finally {
      conn.release();
    }
  }

  // Get statistics
  static async getStatistics() {
    const conn = await pool.getConnection();
    try {
      const [stats] = await conn.execute(`
        SELECT 
          COUNT(*) as total_coupons,
          SUM(CASE WHEN status = 'kosong' THEN 1 ELSE 0 END) as kosong,
          SUM(CASE WHEN status = 'terdaftar' THEN 1 ELSE 0 END) as terdaftar,
          SUM(CASE WHEN status = 'diambil' THEN 1 ELSE 0 END) as diambil
        FROM coupons
      `);
      return stats[0];
    } finally {
      conn.release();
    }
  }

  // Get distribution progress for graph
  static async getDistributionProgress() {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.execute(`
        SELECT 
          status,
          COUNT(*) as count
        FROM coupons
        GROUP BY status
      `);
      return rows;
    } finally {
      conn.release();
    }
  }

  // Update coupon
  static async update(id, { nama_penerima, rt, rw, alamat, status, photo_penerima }) {
    const conn = await pool.getConnection();
    try {
      const updates = [];
      const values = [];

      if (nama_penerima !== undefined) {
        updates.push('nama_penerima = ?');
        values.push(nama_penerima);
      }
      if (rt !== undefined) {
        updates.push('rt = ?');
        values.push(rt);
      }
      if (rw !== undefined) {
        updates.push('rw = ?');
        values.push(rw);
      }
      if (alamat !== undefined) {
        updates.push('alamat = ?');
        values.push(alamat);
      }
      if (photo_penerima !== undefined) {
        updates.push('photo_penerima = ?');
        values.push(photo_penerima);
      }
      if (status !== undefined) {
        updates.push('status = ?');
        values.push(status);
      }

      if (updates.length === 0) {
        return false;
      }

      values.push(id);

      const [result] = await conn.execute(
        `UPDATE coupons SET ${updates.join(', ')} WHERE id = ?`,
        values
      );

      return result.affectedRows > 0;
    } finally {
      conn.release();
    }
  }

  // Delete coupon
  static async delete(id) {
    const conn = await pool.getConnection();
    try {
      const [result] = await conn.execute(
        'DELETE FROM coupons WHERE id = ?',
        [id]
      );
      return result.affectedRows > 0;
    } finally {
      conn.release();
    }
  }

  // Delete all coupons
  static async deleteAll() {
    const conn = await pool.getConnection();
    try {
      const [result] = await conn.execute('DELETE FROM coupons');
      return result.affectedRows >= 0;
    } finally {
      conn.release();
    }
  }

  // Get coupon by ID
  static async getById(id) {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.execute(
        'SELECT * FROM coupons WHERE id = ?',
        [id]
      );
      return rows[0] || null;
    } finally {
      conn.release();
    }
  }
}

module.exports = CouponModel;