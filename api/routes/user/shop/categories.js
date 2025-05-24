// admin/categories.js
const express = require('express');

const {
    getActiveCategoriesInShop
} = require('../../../controllers/user_controllers/shop_controllers/categoryControllerUser');

const router = express.Router();

router.get('/getActiveCategoriesInShop/:shopId', getActiveCategoriesInShop);

module.exports = router;