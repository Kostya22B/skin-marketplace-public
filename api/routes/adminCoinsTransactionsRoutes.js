// api/routes/adminCoinsTransactionsRoutes.js
const express = require('express');
const router = express.Router();
const coinsController = require('../controllers/admin_controllers/coinsTransactionControllerAdmin');

router.get('/transactions', coinsController.getAdminCoinsTransactions);
router.get('/searchUser', coinsController.searchUserByEmail);

router.post('/add', coinsController.addCoinsToUser);

module.exports = router;