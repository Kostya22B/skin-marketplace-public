// productModel.js
const { DataTypes } = require('sequelize');
const sequelize = require('../db');
//TODO
const Service = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  service_id:{
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "test_service"
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
});

module.exports = Service;
