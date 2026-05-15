const express = require('express');
const CouponController = require('../controllers/CouponController');

const router = express.Router();

// Generate coupons
router.post('/generate', CouponController.generateCoupons);

// Get all coupons
router.get('/', CouponController.getAllCoupons);

// Get single coupon by QR secret
router.get('/:qr_secret', CouponController.getCoupon);

// Register coupon (scan form submission)
router.post('/register', CouponController.registerCoupon);

// Confirm pickup
router.post('/confirm-pickup', CouponController.confirmPickup);

// Get QR code image
router.get('/qr/:qr_secret', CouponController.generateQRImage);

module.exports = router;
