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

  static async updateTransaction(req, res) {
    try {
      const { id } = req.params;
      const { type, title, amount, transaction_date, category } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'ID transaksi tidak valid.' });
      }

      if (!type || !title || !amount || !transaction_date || !category) {
        return res.status(400).json({ error: 'Data wajib belum lengkap (Judul, Nominal, Tanggal, Kategori).' });
      }

      const existingTransaction = await TransactionModel.getById(id);
      if (!existingTransaction) {
        return res.status(404).json({ error: 'Data transaksi tidak ditemukan.' });
      }

      const result = await TransactionModel.update(id, req.body);
      res.json({ success: true, message: 'Data keuangan berhasil diperbarui.', affectedRows: result.affectedRows });
    } catch (error) {
      console.error('Error updating transaction:', error);
      res.status(500).json({ error: error.message });
    }
  }

  static async deleteTransaction(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ error: 'ID transaksi tidak valid.' });
      }

      const existingTransaction = await TransactionModel.getById(id);
      if (!existingTransaction) {
        return res.status(404).json({ error: 'Data transaksi tidak ditemukan.' });
      }

      const result = await TransactionModel.delete(id);
      res.json({ success: true, message: 'Data keuangan berhasil dihapus.', affectedRows: result.affectedRows });
    } catch (error) {
      console.error('Error deleting transaction:', error);
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