//productControllerAdmin.js

const Category = require('../../../models/shop/categoryModel');
const Product = require('../../../models/shop/productModel');

exports.getAllProducts = async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
    }
    try {
        const products = await Product.findAll({
            order: [['name', 'ASC']],
            attributes: ['id',
                'name',
                'description',
                'price_rub',
                'price_uah',
                'price_eur',
                'price_bufferkacoin',
                'picture',
                'categoryId'],
        }
        );
        res.status(200).json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
//TODO if needed add shopid check
exports.getAllProductsInCategory = async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
    }
    try {
        const { categoryId } = req.params;
        const products = await Product.findAll({ where: { categoryId: categoryId }, order: [['name', 'ASC']] });
        res.status(200).json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.addProduct = async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
    }
    try {
        const { categoryId,
            name,
            description,
            price_rub,
            price_uah,
            price_eur,
            price_bufferkacoin,
            stock,
            picture,
            picture_compressed
        } = req.body;

        if (
            !name ||
            !description ||
            !price_rub ||
            !price_uah ||
            !price_eur ||
            !price_bufferkacoin
        ) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const category = await Category.findByPk(categoryId);
        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }

        const newProduct = await Product.create({
            name,
            description,
            price_rub,
            price_uah,
            price_eur,
            price_bufferkacoin,
            stock,
            picture,
            picture_compressed,
            categoryId,
        });

        res.status(201).json(newProduct);
    } catch (error) {
        console.error('Error adding product:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.updateProduct = async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
    }
    try {
        // Берём id из req.body
        const { id, ...updateData } = req.body;
        const [updated] = await Product.update(updateData, { where: { id } });
        if (updated) {
            const updatedProduct = await Product.findOne({ where: { id } });
            res.status(200).json(updatedProduct);
        } else {
            res.status(404).json({ error: 'Product not found' });
        }
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


exports.updateProductStatus = async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
    }
    try {
        const { id, status } = req.body;
        if (!['active', 'disabled', 'is_archived'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status value' });
        }
        const product = await Product.findByPk(id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        product.status = status;
        await product.save();
        res.status(200).json(product);
    } catch (error) {
        console.error('Error updating product status:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


exports.deleteProduct = async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
    }
    try {
        const { productId } = req.params;
        const deleted = await Product.destroy({ where: { id: productId } });
        if (deleted) {
            res.status(204).send();
        } else {
            res.status(404).json({ error: 'Product not found' });
        }
    } catch (error) {
        console.error('Error adding product:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};