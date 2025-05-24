// admin/products.js
const express = require('express');

const {getAllProducts,
    getAllProductsInCategory,
    addProduct,
    updateProduct,
    updateProductStatus,
    deleteProduct
} = require('../../../controllers/admin_controllers/shop_contollers/productControllerAdmin');

const router = express.Router();

router.get('/readAll', getAllProducts);
router.get('/category/:categoryId', getAllProductsInCategory);
router.post('/add_product', addProduct);
router.post('/update_product', updateProduct);
router.post('/update_product_status', updateProductStatus);
router.post('/delete/:productId', deleteProduct);

module.exports = router;