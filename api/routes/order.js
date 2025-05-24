const express = require('express');
const router = express.Router();
const orderController = require('../controllers/user_controllers/orderController');
const orderControllerAdmin = require('../controllers/admin_controllers/orderControllerAdmin');

//admin routes
router.get('/admin/readAll', orderControllerAdmin.getAllOrders);
router.post('/admin/updateStatus', orderControllerAdmin.updateOrderStatus);
router.get('/admin/export', orderControllerAdmin.exportOrdersToExcel)

//user routes
router.post('/create', orderController.createOrder);
router.get('/:orderId', orderController.getOrderDetails);
router.get('/user/:userId', orderController.getUserOrders);


module.exports = router;
