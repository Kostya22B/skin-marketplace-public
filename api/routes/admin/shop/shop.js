// admin/shop.js
const express = require('express');

const {getAllShops,
    getActiveShops,
    getShopDetailsById,
    addShop,
    updateShop,
    updateShopStatus,
    deleteShop
} = require('../../../controllers/admin_controllers/shop_contollers/shopControllerAdmin');

const router = express.Router();

router.get('/readAll', getAllShops);
router.get('/active', getActiveShops);
router.get('/details/:shopId', getShopDetailsById);
router.post('/add_shop', addShop);
router.post('/update_shop', updateShop);
router.post('/update_shop_status', updateShopStatus);
router.post('/delete/:shopId', deleteShop);

module.exports = router;