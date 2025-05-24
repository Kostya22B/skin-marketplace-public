// admin/products.js
const express = require('express');

const {getActiveProductsInCategory
} = require('../../../controllers/user_controllers/shop_controllers/productControllerUser');

const router = express.Router();

router.get('/getActiveProductsInCategory/:categoryId', getActiveProductsInCategory);

module.exports = router;