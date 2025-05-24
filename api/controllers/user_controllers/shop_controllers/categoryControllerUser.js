//categoryControllerAdmin.js

const Shop = require('../../../models/shop/shopModel');
const Category = require('../../../models/shop/categoryModel');
const Product = require('../../../models/shop/productModel');

exports.getActiveCategoriesInShop = async (req, res) => {
  try {
    const { shopId } = req.params;
    const categories = await Category.findAll({ where: { 
      shopId: shopId,
      status: 'active'
    }, order: [['name', 'ASC']] });
    res.status(200).json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
