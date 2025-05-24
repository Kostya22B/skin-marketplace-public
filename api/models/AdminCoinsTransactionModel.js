// api/models/adminCoinsTransactionModel.js
const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const User = require('./userModel');

const AdminCoinsTransaction = sequelize.define('AdminCoinsTransaction', {
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
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
  },
  coins: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
}, {
  timestamps: true,
  tableName: 'admin_coins_transactions',
});



module.exports = AdminCoinsTransaction;
