//productControllerAdmin.js

const Category = require('../../../models/shop/categoryModel');
const Product = require('../../../models/shop/productModel');

//TODO if needed add shopid check
exports.getActiveProductsInCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const products = await Product.findAll({ where: { 
            categoryId: categoryId,
            status: 'active'
         }, order: [['price_rub', 'ASC']] });
        res.status(200).json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};