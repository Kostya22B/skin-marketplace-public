// associations.js

const Order = require('./orderModel');
const OrderItem = require('./orderItemModel');

const Cart = require('./cart/cartModel');
const CartItem = require('./cart/cartItemModel');

const User = require('./userModel');

const Coupon = require('./coupons/couponModel');
const UserCoupon = require('./coupons/userCouponModel');

const AdminCoinsTransaction = require('./AdminCoinsTransactionModel');

const TransactionOrder = require('../models/transactionOrderModel');

const Shop = require('./shop/shopModel');
const Category = require('./shop/categoryModel');
const Product = require('./shop/productModel');

Order.hasMany(OrderItem, { as: 'items', foreignKey: 'orderId' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });

OrderItem.belongsTo(Product, { foreignKey: 'productId' });

Order.belongsTo(Cart, { foreignKey: 'cartId', onDelete: 'SET NULL' });
Order.belongsTo(User, { foreignKey: 'userId', as: 'User' });
User.hasMany(Order, { foreignKey: 'userId', as: 'Orders' });

Cart.hasMany(CartItem, { as: 'items', foreignKey: 'cartId', onDelete: 'CASCADE' });
CartItem.belongsTo(Cart, { foreignKey: 'cartId' });

CartItem.belongsTo(Product, { foreignKey: 'productId' });

// coupon <=> user
User.hasMany(UserCoupon, { foreignKey: 'userId', as: 'coupons' });
Coupon.hasMany(UserCoupon, { foreignKey: 'couponId', as: 'users' });
UserCoupon.belongsTo(User, { foreignKey: 'userId' });
UserCoupon.belongsTo(Coupon, { foreignKey: 'couponId' });

// coupon <=> cart/order
Cart.belongsTo(Coupon, { foreignKey: 'appliedCouponId', as: 'appliedCoupon' });
Order.belongsTo(UserCoupon, { foreignKey: 'usedCouponId', as: 'usedCoupon' });
Order.belongsTo(Coupon, { foreignKey: 'usedCouponId', as: 'appliedCoupon' });

//User.role = admin <=> CoinTransactionAdd <=> User
AdminCoinsTransaction.belongsTo(User, { as: 'Admin', foreignKey: 'adminId' });
AdminCoinsTransaction.belongsTo(User, { as: 'User', foreignKey: 'userId' });

Order.hasMany(TransactionOrder, { foreignKey: 'orderId', onDelete: 'CASCADE' });
TransactionOrder.belongsTo(Order, { foreignKey: 'orderId' });

//Shop <=> Category <=> Product
Shop.hasMany(Category, { as: 'categories', foreignKey: 'shopId', onDelete: 'CASCADE' });

Category.belongsTo(Shop, { foreignKey: 'shopId' });
Category.hasMany(Product, { as: 'products', foreignKey: 'categoryId', onDelete: 'CASCADE' });

module.exports = { Order, OrderItem, 
    Cart, CartItem, 
    Product, Category, Shop,
    User, 
    Coupon, UserCoupon, 
    AdminCoinsTransaction };
