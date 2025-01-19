const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

router.post('/create', orderController.createOrder);
router.get('/:orderId', orderController.getOrderDetails);
router.get('/user/:userId', orderController.getUserOrders);


module.exports = router;
