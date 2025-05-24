// admin/categories.js
const express = require('express');

const {getAllCategories,
    getAllCategoriesInShop,
    addCategory,
    updateCategory,
    updateCategoryStatus,
    deleteCategory
} = require('../../../controllers/admin_controllers/shop_contollers/categoryControllerAdmin');

const router = express.Router();

router.get('/readAll', getAllCategories);
router.get('/categoriesInShop/:shopId', getAllCategoriesInShop);
router.post('/add_category', addCategory);
router.post('/update_category', updateCategory);
router.post('/update_category_status', updateCategoryStatus);
router.post('/delete/:categoryId', deleteCategory);

module.exports = router;