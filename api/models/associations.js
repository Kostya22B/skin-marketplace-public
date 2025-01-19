// associations.js

const Order = require('./orderModel');
const OrderItem = require('./orderItemModel');

const Cart = require('./cart/cartModel');
const CartItem = require('./cart/cartItemModel');

const Product = require('./productModel');

const User = require('./userModel');

const Coupon = require('./coupons/couponModel');
const UserCoupon = require('./coupons/userCouponModel');

Order.hasMany(OrderItem, { as: 'items', foreignKey: 'orderId' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });

OrderItem.belongsTo(Product, { foreignKey: 'productId' });

Order.belongsTo(User, { foreignKey: 'userId', as: 'User' });
User.hasMany(Order, { foreignKey: 'userId', as: 'Orders' });

Cart.hasMany(CartItem, { as: 'items', foreignKey: 'cartId' });
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


module.exports = { Order, OrderItem, Cart, CartItem, Product, User, Coupon, UserCoupon };
