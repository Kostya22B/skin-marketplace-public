const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const User = require('./userModel');
const Coupon  = require('./coupons/couponModel');
const Cart  = require('./cart/cartModel');

const Order = sequelize.define('Order', {
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
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM,
    values: ['awaiting payment', 'paid', 'expired', 'processing after payment', 'delivered'],
    defaultValue: 'awaiting payment',
  },
  currency: {
    type: DataTypes.ENUM,
    values: ['UAH', 'RUB', 'EUR', 'bufferkacoin'],
    defaultValue: 'RUB',
  },
  usedCouponId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: Coupon,
      key: 'id',
    },
  },
  cartId: {
    type: DataTypes.UUID,
    allowNull: true, 
    //.!. for deleting carts by trigger ones per month. 
    // They are needed if user have some problems
    references: {
      model: Cart,
      key: 'id',
    },
  },
  
}, {
  timestamps: true,
  tableName: 'orders',
});

module.exports = Order;
