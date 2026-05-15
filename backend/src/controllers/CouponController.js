const CouponModel = require('../models/CouponModel');
const QRCode = require('qrcode');

class CouponController {
  // Generate multiple coupons
  static async generateCoupons(req, res) {
    try {
      const { count } = req.body;
      
      if (!count || count < 1 || count > 1000) {
        return res.status(400).json({ 
          error: 'Invalid count. Please provide between 1 and 1000 coupons.' 
        });
      }

      const coupons = await CouponModel.createMultiple(count);
      
      res.status(201).json({ 
        success: true,
        message: `${count} coupons generated successfully`,
        data: coupons 
      });
    } catch (error) {
      console.error('Error generating coupons:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Get coupon by QR secret
  static async getCoupon(req, res) {
    try {
      const { qr_secret } = req.params;
      
      if (!qr_secret) {
        return res.status(400).json({ error: 'QR secret is required' });
      }

      const coupon = await CouponModel.getByCouponSecret(qr_secret);
      
      if (!coupon) {
        return res.status(404).json({ error: 'Coupon not found' });
      }

      res.json({ success: true, data: coupon });
    } catch (error) {
      console.error('Error fetching coupon:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Register coupon (scan & input data)
  static async registerCoupon(req, res) {
    try {
      const { qr_secret, nama_penerima, rt, rw, alamat } = req.body;
      
      if (!qr_secret || !nama_penerima || !rt || !rw || !alamat) {
        return res.status(400).json({ error: 'All fields are required' });
      }

      const coupon = await CouponModel.getByCouponSecret(qr_secret);
      if (!coupon) {
        return res.status(404).json({ error: 'Coupon not found' });
      }

      if (coupon.status !== 'kosong') {
        return res.status(400).json({ 
          error: `Coupon cannot be registered. Current status: ${coupon.status}` 
        });
      }

      const registered = await CouponModel.register(qr_secret, nama_penerima, rt, rw, alamat);
      
      if (registered) {
        res.json({ 
          success: true, 
          message: 'Coupon registered successfully',
          data: { qr_secret, nama_penerima, rt, rw, alamat, status: 'terdaftar' }
        });
      } else {
        res.status(400).json({ error: 'Failed to register coupon' });
      }
    } catch (error) {
      console.error('Error registering coupon:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Confirm pickup
  static async confirmPickup(req, res) {
    try {
      const { qr_secret } = req.body;
      
      if (!qr_secret) {
        return res.status(400).json({ error: 'QR secret is required' });
      }

      const coupon = await CouponModel.getByCouponSecret(qr_secret);
      if (!coupon) {
        return res.status(404).json({ error: 'Coupon not found' });
      }

      if (coupon.status !== 'terdaftar') {
        return res.status(400).json({ 
          error: `Cannot confirm pickup. Current status: ${coupon.status}` 
        });
      }

      const confirmed = await CouponModel.confirmPickup(qr_secret);
      
      if (confirmed) {
        const updated = await CouponModel.getByCouponSecret(qr_secret);
        res.json({ 
          success: true, 
          message: 'Pickup confirmed',
          data: updated
        });
      } else {
        res.status(400).json({ error: 'Failed to confirm pickup' });
      }
    } catch (error) {
      console.error('Error confirming pickup:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Get all coupons (for admin)
  static async getAllCoupons(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 100;
      const offset = parseInt(req.query.offset) || 0;

      const result = await CouponModel.getAll(limit, offset);
      
      res.json({ success: true, data: result });
    } catch (error) {
      console.error('Error fetching coupons:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Get dashboard statistics
  static async getStatistics(req, res) {
    try {
      const stats = await CouponModel.getStatistics();
      const progress = await CouponModel.getDistributionProgress();

      res.json({ 
        success: true, 
        data: {
          statistics: stats,
          progress: progress
        }
      });
    } catch (error) {
      console.error('Error fetching statistics:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Generate QR Code as image
  static async generateQRImage(req, res) {
    try {
      const { qr_secret } = req.params;
      
      if (!qr_secret) {
        return res.status(400).json({ error: 'QR secret is required' });
      }

      const qrImage = await QRCode.toDataURL(qr_secret, { 
        width: 200,
        errorCorrectionLevel: 'H'
      });
      
      res.json({ success: true, qr_image: qrImage });
    } catch (error) {
      console.error('Error generating QR:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = CouponController;
