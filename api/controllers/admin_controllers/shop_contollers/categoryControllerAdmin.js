//categoryControllerAdmin.js

const Shop = require('../../../models/shop/shopModel');
const Category = require('../../../models/shop/categoryModel');
const Product = require('../../../models/shop/productModel');

exports.getAllCategories = async (req, res) => {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied' });
  }
  try {
    const categories = await Category.findAll({
      order: [['name', 'ASC']]
    }
    );
    res.status(200).json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getAllCategoriesInShop = async (req, res) => {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied' });
  }
  try {
    const { shopId } = req.params;
    const categories = await Category.findAll({ where: { shopId: shopId }, order: [['name', 'ASC']] });
    res.status(200).json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getCategoryById = async (req, res) => {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied' });
  }
  try {
    const { categoryId } = req.params;
    const category = await Category.findOne({
      where: { id: categoryId },
      include: [
        {
          model: Product,
          as: 'products',
        },
      ],
    });

    if (!category) {
      console.log(`Category with ID ${categoryId} not found`);
      return res.status(404).json({ message: 'Category not found' });
    }
    res.status(200).json(category);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.addCategory = async (req, res) => {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied' });
  }
  try {
    const { shopId,
      name,
      nameLink,
      description,
      picture,
      status } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const shop = await Shop.findByPk(shopId);
    if (!shop) {
      return res.status(404).json({ error: 'Shop not found' });
    }

    const newCategory = await Category.create({
      name,
      nameLink,
      description,
      picture,
      shopId,
      status
    });
    res.status(201).json(newCategory);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.updateCategory = async (req, res) => {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied' });
  }
  try {
    // Берём id из req.body
    const { id, ...updateData } = req.body;
    const [updated] = await Category.update(updateData, { where: { id } });
    if (updated) {
      const updatedCategory = await Category.findOne({ where: { id } });
      res.status(200).json(updatedCategory);
    } else {
      res.status(404).json({ error: 'Category not found' });
    }
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


exports.updateCategoryStatus = async (req, res) => {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied' });
  }
  try {
    const { id, status } = req.body;
    if (!['active', 'disabled', 'is_archived'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }
    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    category.status = status;
    await category.save();
    res.status(200).json(category);
  } catch (error) {
    console.error('Error updating category status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


exports.deleteCategory = async (req, res) => {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied' });
  }
  try {
    const { categoryId } = req.params;
    const deleted = await Category.destroy({ where: { id: categoryId } });
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ error: 'Category not found' });
    }
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};