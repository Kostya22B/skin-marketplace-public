// productModel.js
const { DataTypes } = require('sequelize');
const sequelize = require('../../db');
const CategoryModel = require('./categoryModel');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  name_en: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description_en: {
    type: DataTypes.STRING,
    allowNull: true,
  }, 
  price_uah: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  price_rub: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  price_eur: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 20,
  },
  price_bufferkacoin: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 20,
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  picture: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  picture_compressed: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  categoryId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: CategoryModel,
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  status: {
    type: DataTypes.ENUM,
    values: ['active', 'disabled', 'is_archived'],
    defaultValue: 'active',
},
}, {
  timestamps: true,
  tableName: 'products',
});

module.exports = Product;
