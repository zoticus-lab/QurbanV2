const express = require('express');
const TransactionController = require('../controllers/TransactionController');

const router = express.Router();

router.post('/', TransactionController.addTransaction);
router.get('/', TransactionController.getTransactions);

module.exports = router;