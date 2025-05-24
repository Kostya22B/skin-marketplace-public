// admin/shop.js
const express = require('express');

const {
    getActiveShops
} = require('../../../controllers/user_controllers/shop_controllers/shopControllerUser');

const router = express.Router();

router.get('/getActive', getActiveShops);

module.exports = router;