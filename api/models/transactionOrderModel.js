const { DataTypes } = require('sequelize');
const User = require('./userModel');
const Order  = require('./orderModel');
const sequelize = require('../db');

const TransactionOrder = sequelize.define('TransactionOrder', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  adminId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
  },
  orderId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Order,
      key: 'id',
    },
  },
  previousStatus: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  newStatus: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  timestamps: true,
  tableName: 'transaction_orders',
});

module.exports = TransactionOrder;