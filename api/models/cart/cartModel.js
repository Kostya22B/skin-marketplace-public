// cartModel.js
const { DataTypes } = require('sequelize');
const sequelize = require('../../db');
const User = require('../userModel');
const Coupon = require('../coupons/couponModel')

const Cart = sequelize.define('Cart', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
  },
  status: {
    type: DataTypes.ENUM,
    values: ['active', 'processing', 'delivered'],
    defaultValue: 'active',
  },
  appliedCouponId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: Coupon,
      key: 'id',
    },
  },
}, {
  timestamps: true,
  tableName: 'carts',
});

module.exports = Cart;
