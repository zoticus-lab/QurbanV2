const pool = require('../database/config');

class TransactionModel {
  static async create(data) {
    const conn = await pool.getConnection();
    try {
      const [result] = await conn.execute(
        `INSERT INTO transactions 
         (type, title, amount, transaction_date, category, proof_image, goods_image) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [data.type, data.title, data.amount, data.transaction_date, data.category, data.proof_image || null, data.goods_image || null]
      );
      return result.insertId;
    } finally {
      conn.release();
    }
  }

  static async getById(id) {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.execute(
        'SELECT * FROM transactions WHERE id = ?',
        [id]
      );
      return rows[0] || null;
    } finally {
      conn.release();
    }
  }

  static async getAll() {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.execute(
        'SELECT * FROM transactions ORDER BY transaction_date DESC, created_at DESC'
      );
      return rows;
    } finally {
      conn.release();
    }
  }

  static async update(id, data) {
    const conn = await pool.getConnection();
    try {
      const [result] = await conn.execute(
        `UPDATE transactions
         SET type = ?, title = ?, amount = ?, transaction_date = ?, category = ?, proof_image = ?, goods_image = ?
         WHERE id = ?`,
        [data.type, data.title, data.amount, data.transaction_date, data.category, data.proof_image || null, data.goods_image || null, id]
      );
      return result;
    } finally {
      conn.release();
    }
  }

  static async delete(id) {
    const conn = await pool.getConnection();
    try {
      const [result] = await conn.execute(
        'DELETE FROM transactions WHERE id = ?',
        [id]
      );
      return result;
    } finally {
      conn.release();
    }
  }
}

module.exports = TransactionModel;