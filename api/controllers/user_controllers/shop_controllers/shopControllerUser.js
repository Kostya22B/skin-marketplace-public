// shopControllerAdmin.js
const Shop = require('../../../models/shop/shopModel');
const Category = require('../../../models/shop/categoryModel');
const Product = require('../../../models/shop/productModel');

exports.getActiveShops = async (req, res) => {
  try {
    const shops = await Shop.findAll({
      where: { status: 'active' }, order: [['name', 'ASC']]
    });
    res.status(200).json(shops);
  } catch (error) {
    console.error('Error fetching active shops:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
