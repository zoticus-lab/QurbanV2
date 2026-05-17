const express = require('express');
const CouponController = require('../controllers/CouponController');

const router = express.Router();

// Specific routes FIRST (before parameter routes)
// Generate coupons
router.post('/generate', CouponController.generateCoupons);

// Register coupon (scan form submission)
router.post('/register', CouponController.registerCoupon);

// Confirm pickup
router.post('/confirm-pickup', CouponController.confirmPickup);

// Get QR code image
router.get('/qr/:qr_secret', CouponController.generateQRImage);

// Generic routes AFTER specific routes
// Get all coupons
router.get('/', CouponController.getAllCoupons);

// Parameter-based routes LAST (match by ID or secret)
// Get single coupon by ID or QR secret
router.get('/:identifier', (req, res, next) => {
  // If identifier is a number, treat as ID, otherwise as QR secret
  const identifier = req.params.identifier;
  if (/^\d+$/.test(identifier)) {
    req.params.id = identifier;
    CouponController.getCoupon(req, res);
  } else {
    req.params.qr_secret = identifier;
    CouponController.getCoupon(req, res);
  }
});

// Update coupon by ID
router.put('/:id', CouponController.updateCoupon);

// Delete coupon by ID
router.delete('/:id', CouponController.deleteCoupon);

module.exports = router;
