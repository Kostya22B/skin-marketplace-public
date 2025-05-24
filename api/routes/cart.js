// routes/cart.js
const express = require('express');
const router = express.Router();
const cartController = require('../controllers/user_controllers/cartController');
const cartControllerAdmin = require('../controllers/admin_controllers/cartControllerAdmin')
const couponController = require('../controllers/user_controllers/couponController');

router.post('/add', cartController.addItemToCart);
router.get('/view', cartController.viewCart);
router.post('/remove', cartController.removeItemFromCart);
router.post('/update-quantity', cartController.updateItemQuantity);
router.post('/apply-coupon', couponController.applyCoupon);
router.post('/clear-coupon', cartController.clearCoupon);

router.get('/admin/readAll', cartControllerAdmin.getAllProcessingCarts);
router.post('/admin/updateStatus', cartControllerAdmin.updateCartStatus);

module.exports = router;
