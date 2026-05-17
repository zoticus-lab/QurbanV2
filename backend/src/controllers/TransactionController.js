const TransactionModel = require('../models/TransactionModel');

class TransactionController {
  static async addTransaction(req, res) {
    try {
      const { type, title, amount, transaction_date, category, proof_image, goods_image } = req.body;
      
      if (!type || !title || !amount || !transaction_date || !category) {
        return res.status(400).json({ error: 'Data wajib belum lengkap (Judul, Nominal, Tanggal, Kategori).' });
      }

      const insertId = await TransactionModel.create(req.body);
      res.status(201).json({ success: true, message: 'Data keuangan berhasil disimpan.', id: insertId });
    } catch (error) {
      console.error('Error adding transaction:', error);
      res.status(500).json({ error: error.message });
    }
  }

  static async getTransactions(req, res) {
    try {
      const transactions = await TransactionModel.getAll();
      res.json({ success: true, data: transactions });
    } catch (error) {
      console.error('Error getting transactions:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = TransactionController;