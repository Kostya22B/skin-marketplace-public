// shopControllerAdmin.js
const Shop = require('../../../models/shop/shopModel');
const Category = require('../../../models/shop/categoryModel');
const Product = require('../../../models/shop/productModel');

exports.getAllShops = async (req, res) => {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied' });
  }
  try {
    const shops = await Shop.findAll({
      order: [['name', 'ASC']]
    }
    );
    res.status(200).json(shops);
  } catch (error) {
    console.error('Error fetching shops:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getActiveShops = async (req, res) => {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied' });
  }
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

exports.getShopDetailsById = async (req, res) => {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied' });
  }
  try {
    const { shopId } = req.params;
    const shop = await Shop.findByPk(shopId, {
      include: {
        model: Category,
        include: [Product],
      },
    });

    if (!shop) {
      console.log(`Shop with ID ${shopId} not found`);
      return res.status(404).json({ message: 'Shop not found' });
    }
    res.status(200).json(shop);
  } catch (error) {
    console.error('Error fetching shop:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.addShop = async (req, res) => {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied' });
  }
  try {
    // TODO with picture normally. So admin can add it manually as file and save it to the server package
    //try to think how to save it by server permissions
    const { name,
      nameLink,
      description,
      picture,
      status } = req.body;

    if (!name || !description || !nameLink || !status) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const newShop = await Shop.create({
      name,
      nameLink,
      description,
      picture,
      status,
    });
    res.status(201).json(newShop);
  } catch (error) {
    console.error('Error adding shop:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.updateShop = async (req, res) => {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied' });
  }
  try {
    // Берём id из req.body
    const { id, ...updateData } = req.body;
    const [updated] = await Shop.update(updateData, { where: { id } });
    if (updated) {
      const updatedShop = await Shop.findOne({ where: { id } });
      res.status(200).json(updatedShop);
    } else {
      res.status(404).json({ error: 'Shop not found' });
    }
  } catch (error) {
    console.error('Error updating shop:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


exports.updateShopStatus = async (req, res) => {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied' });
  }
  try {
    const { id, status } = req.body;
    if (!['active', 'disabled', 'is_archived'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }
    const shop = await Shop.findByPk(id);
    if (!shop) {
      return res.status(404).json({ message: 'Shop not found' });
    }
    shop.status = status;
    await shop.save();
    res.status(200).json(shop);
  } catch (error) {
    console.error('Error updating shop status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.deleteShop = async (req, res) => {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied' });
  }
  try {
    const { shopId } = req.params;
    const deleted = await Shop.destroy({ where: { id: shopId } });
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ error: 'Shop not found' });
    }
  } catch (error) {
    console.error('Error adding shop:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};