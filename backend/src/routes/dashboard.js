const express = require('express');
const CouponController = require('../controllers/CouponController');

const router = express.Router();

// Get dashboard statistics
router.get('/stats', CouponController.getStatistics);

module.exports = router;
