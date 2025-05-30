const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const Product = require('./shop/productModel');

const OrderItem = sequelize.define('OrderItem', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  orderId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  productId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: Product,
      key: 'id',
    },
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM,
    values: ['pending', 'delivered'],
    defaultValue: 'pending',
  },
}, {
  timestamps: true,
  tableName: 'order_items',
});

module.exports = OrderItem;
