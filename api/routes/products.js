// products.js
const express = require('express');
const { getProductById } = require('../controllers/user_controllers/productController');

const router = express.Router();

router.get('/:productId', getProductById);

module.exports = router;