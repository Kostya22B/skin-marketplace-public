// controllers/productController.js
const Product = require('../../models/shop/productModel');

exports.getProductById = async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findByPk(productId);

    if (!product) {
      console.log(`Product with ID ${productId} not found`);
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
