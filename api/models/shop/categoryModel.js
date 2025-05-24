// serviceModel.js
const { DataTypes } = require('sequelize');
const sequelize = require('../../db');
const ShopModel = require('./shopModel');

const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  name_en: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  description_en: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  nameLink: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  picture: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  picture_compressed: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM,
    values: ['active', 'disabled', 'is_archived'],
    defaultValue: 'active',
  },
  shopId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: ShopModel,
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
}, {
  timestamps: true,
  tableName: 'categories',
});

module.exports = Category;
