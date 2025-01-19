// models/coupons/couponModel.js
const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const User = require('../models/userModel');
const Order = require('../models/orderModel');

const CoinsTransactions = sequelize.define('CoinsTransactions', {
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
    onDelete: 'CASCADE',
  },
  orderId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Order,
      key: 'id',
    },
  },
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
}, {
  tableName: 'coins_transactions',
  timestamps: true,
});

module.exports = CoinsTransactions;