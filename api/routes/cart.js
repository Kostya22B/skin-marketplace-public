// routes/cart.js
const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const couponController = require('../controllers/couponController');

router.post('/add', cartController.addItemToCart);
router.get('/view', cartController.viewCart);
router.post('/remove', cartController.removeItemFromCart);
router.post('/update-quantity', cartController.updateItemQuantity);
router.post('/apply-coupon', couponController.applyCoupon);
router.post('/clear-coupon', cartController.clearCoupon);

module.exports = router;
