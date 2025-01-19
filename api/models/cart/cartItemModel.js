// cartItemModel.js
const { DataTypes } = require('sequelize');
const sequelize = require('../../db');
const Cart = require('../cart/cartModel');
const Product = require('../productModel');

const CartItem = sequelize.define('CartItem', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  cartId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Cart,
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Product,
      key: 'id',
    },
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
}, {
  timestamps: true,
  tableName: 'cart_items',
});

module.exports = CartItem;
