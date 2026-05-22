const express = require('express');
const TransactionController = require('../controllers/TransactionController');

const router = express.Router();

router.post('/', TransactionController.addTransaction);
router.get('/', TransactionController.getTransactions);
router.put('/:id', TransactionController.updateTransaction);
router.delete('/:id', TransactionController.deleteTransaction);

module.exports = router;