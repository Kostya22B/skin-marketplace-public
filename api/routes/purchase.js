// routes/purchase.js
const express = require('express');
const router = express.Router();
const purchaseController = require('../controllers/user_controllers/purchaseController');

// Проверьте, что все эти функции действительно определены в контроллере
router.post('/initiate', purchaseController.initiatePurchase);
router.post('/notification', purchaseController.handleCallback);
router.post('/coinpurchase', purchaseController.payWithCoins);
router.get('/success', purchaseController.successPage);
router.get('/failure', purchaseController.failurePage);
// router.get('/user/:userId', purchaseController.getUserPurchases);

module.exports = router;
