// models//coupons/userCouponModel.js
const { DataTypes } = require('sequelize');
const sequelize = require('../../db');
const User = require('../userModel');
const Coupon = require('../coupons/couponModel');

const UserCoupon = sequelize.define('UserCoupon', {
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
  couponId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Coupon,
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  usedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'user_coupons',
  timestamps: true,
});

module.exports = UserCoupon;
