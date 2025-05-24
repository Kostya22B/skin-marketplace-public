// controllers/purchaseController.js
const Product = require('../../models/shop/productModel');
const CoinsTransactions = require('../../models/coinsTransactionsModel')
const Cart = require('../../models/cart/cartModel');
const CartItem = require('../../models/cart/cartItemModel');
const Order = require('../../models/orderModel');
const OrderItem = require('../../models/orderItemModel');
const Coupon = require('../../models/coupons/couponModel')
const UserCoupon = require('../../models/coupons/userCouponModel')
const User = require('../../models/userModel')
const { notifyPurchase } = require('./telegramController');
const crypto = require('crypto');
const sequelize = require('../../db');
const envFile = process.env.NODE_ENV === 'uat' ? '.env.uat' : '.env';
require('dotenv').config({ path: envFile });


const { MERCHANT_ID, SECRET_KEY, SECRET_KEY2 } = process.env;
const VALID_CURRENCIES = ['RUB', 'UAH', 'EUR'];

exports.initiatePurchase = async (req, res) => {
  const { cartId, totalPrice, currency } = req.body;

  if (!VALID_CURRENCIES.includes(currency)) {
    return res.status(400).json({ message: 'Invalid currency.' });
  }

  const transaction = await sequelize.transaction();

  try {
    const userId = req.session.user.id;

    const cart = await Cart.findOne({ where: { id: cartId, userId }, transaction });
    if (!cart) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Cart not found.' });
    }
    if (cart.status === 'processing') {
      await transaction.rollback();
      return res.status(409).json({ message: 'You have already started buying process' });
    }

    const cartItems = await CartItem.findAll({ where: { cartId: cart.id }, transaction });
    if (cartItems.length === 0) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Cart is empty.' });
    }

    const coupon = cart.appliedCouponId
      ? await Coupon.findByPk(cart.appliedCouponId, { transaction })
      : null;

    // Bulk-req
    const productIds = cartItems.map(item => item.productId);
    const products = await Product.findAll({
      where: { id: productIds },
      transaction,
    });

    // Map cration
    const productMap = products.reduce((acc, product) => {
      acc[product.id] = product;
      return acc;
    }, {});

    // Check
    for (const item of cartItems) {
      if (!productMap[item.productId]) {
        await transaction.rollback();
        return res.status(404).json({ message: 'Product not found for cart item.' });
      }
    }

    const priceField = `price_${currency.toLowerCase()}`;
    let updatedTotal = 0;
    // Calculating total using bulk
    for (const item of cartItems) {
      const product = productMap[item.productId];
      const itemPrice = parseFloat(product[priceField]);
      updatedTotal += itemPrice * item.quantity;
    }

    if (coupon) {
      updatedTotal -= (updatedTotal * coupon.discountValue) / 100;
    }

    if (Math.abs(updatedTotal - totalPrice) > 0.01) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Price mismatch detected.' });
    }

    let order = await Order.findOne({
      where: { cartId: cart.id },
      transaction,
    });

    if (order) {
      await OrderItem.destroy({ where: { orderId: order.id }, transaction });
      order.currency = currency;
      order.usedCouponId = coupon ? coupon.id : null;
      order.status = 'awaiting payment';
      await order.save({ transaction });
    } else {
      const generateUniqueId = () => crypto.randomUUID();
      order = await Order.create(
        {
          id: generateUniqueId(),
          cartId: cart.id,
          userId,
          total: updatedTotal,
          currency,
          status: 'awaiting payment',
          usedCouponId: coupon ? coupon.id : null,
        },
        { transaction }
      );
    }

    const orderItemsData = cartItems.map(item => {
      const product = productMap[item.productId];
      const itemPrice = parseFloat(product[priceField]);
      return {
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
        price: itemPrice,
      };
    });

    await OrderItem.bulkCreate(orderItemsData, { transaction });

    await cart.update({ status: 'processing' }, { transaction });
    await transaction.commit();

    const amount = updatedTotal.toFixed(2);
    const signString = `${MERCHANT_ID}:${amount}:${SECRET_KEY}:${currency}:${order.id}`;
    const sign = crypto.createHash('md5').update(signString).digest('hex');
    const paymentUrl = `https://pay.fk.money/?m=${MERCHANT_ID}&oa=${amount}&currency=${currency}&o=${order.id}&s=${sign}`;

    res.json({ paymentUrl });
  } catch (error) {
    await transaction.rollback();
    console.error('Error during purchase initiation:', error);
    res.status(500).json({ message: 'Error initiating purchase' });
  }
};

exports.handleCallback = async (req, res) => {
  const { MERCHANT_ORDER_ID, AMOUNT, SIGN } = req.body;

  const transaction = await sequelize.transaction();

  try {
    const order = await Order.findOne({ where: { id: MERCHANT_ORDER_ID }, transaction });

    if (!order) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Order not found.' });
    }

    const signString = `${MERCHANT_ID}:${AMOUNT}:${SECRET_KEY2}:${order.id}`;
    const expectedSign = crypto.createHash('md5').update(signString).digest('hex');

    if (SIGN !== expectedSign) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Invalid signature.' });
    }

    const cart = await Cart.findOne({
      where: { id: order.cartId, userId: order.userId, status: 'processing' },
      transaction,
    });

    if (cart && order.usedCouponId) {
      const userCoupon = await UserCoupon.create(
        {
          userId: order.userId,
          couponId: order.usedCouponId,
          usedAt: new Date(),
        },
        { transaction }
      );
      // await order.update({ 
      //   usedCouponId: order.usedCouponId }, { transaction });
    }

    await order.update({ status: 'paid' }, { transaction });
    await cart.destroy({ transaction });

    await transaction.commit();
    await notifyPurchase(order.userId, order.id);

    res.send('YES');
  } catch (error) {
    await transaction.rollback();
    console.error('Error processing callback:', error);
    res.status(500).send('Error processing callback');
  }
};

exports.payWithCoins = async (req, res) => {
  const { cartId, totalPrice, currency } = req.body;
  if (currency !== 'bufferkacoin') {
    return res.status(403).json({ message: 'Bad currency type' });
  }

  let transaction;
  try {
    transaction = await sequelize.transaction();

    const cart = await Cart.findOne({ where: { id: cartId }, transaction });
    if (!cart) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Cart not found' });
    }

    const user = await User.findOne({ where: { id: cart.userId }, transaction });
    if (!user) {
      await transaction.rollback();
      return res.status(404).json({ message: 'User not found' });
    }

    const cartItems = await CartItem.findAll({ where: { cartId: cart.id }, transaction });
    if (cartItems.length === 0) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Cart is empty.' });
    }

    const productIds = cartItems.map(item => item.productId);
    const products = await Product.findAll({
      where: { id: productIds },
      transaction,
    });

    const productMap = products.reduce((acc, product) => {
      acc[product.id] = product;
      return acc;
    }, {});
    for (const item of cartItems) {
      if (!productMap[item.productId]) {
        await transaction.rollback();
        return res.status(404).json({ message: 'Product not found for cart item.' });
      }
    }

    const priceField = `price_${currency.toLowerCase()}`;
    let updatedTotal = 0;
    for (const item of cartItems) {
      const product = productMap[item.productId];
      const itemPrice = parseFloat(product[priceField]);
      updatedTotal += itemPrice * item.quantity;
    }

    if (user.coinsBalance < updatedTotal) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Insufficient coins balance' });
    }

    user.coinsBalance -= updatedTotal;
    await user.save({ transaction });

    req.session.user.coinsBalance -= updatedTotal;
    await req.session.save();

    let order = await Order.findOne({ where: { cartId: cart.id }, transaction });
    const coupon = cart.appliedCouponId
      ? await Coupon.findByPk(cart.appliedCouponId, { transaction })
      : null;

    if (order) {
      await OrderItem.destroy({ where: { orderId: order.id }, transaction });
      order.currency = currency;
      order.usedCouponId = coupon ? coupon.id : null;
      order.status = 'paid';
      await order.save({ transaction });
    } else {
      const generateUniqueId = () => crypto.randomUUID();
      order = await Order.create({
        id: generateUniqueId(),
        cartId: cart.id,
        userId: cart.userId,
        total: updatedTotal,
        currency,
        status: 'paid',
        usedCouponId: coupon ? coupon.id : null,
      }, { transaction });
    }

    const orderItemsData = cartItems.map(item => {
      const product = productMap[item.productId];
      const itemPrice = parseFloat(product[priceField]);
      return {
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
        price: itemPrice,
      };
    });

    await OrderItem.bulkCreate(orderItemsData, { transaction });

    await CoinsTransactions.create({
      userId: cart.userId,
      type: 'spend',
      amount: -updatedTotal,
      orderId: order.id,
    }, { transaction });

    if (cart && order.usedCouponId) {
      const userCoupon = await UserCoupon.create(
        {
          userId: order.userId,
          couponId: order.usedCouponId,
          usedAt: new Date(),
        },
        { transaction }
      );
      // await order.update({ 
      //   usedCouponId: order.usedCouponId }, { transaction });
    }

    await cart.destroy({ transaction });
    await transaction.commit();

    const redirect = '/profile';
    await notifyPurchase(order.userId, order.id);
    res.json({ redirect });
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error('Error paying with coins:', error);
    res.status(500).json({ message: 'Error paying with coins' });
  }
};




exports.successPage = (req, res) => {
  res.redirect('/payment/success');
};

exports.failurePage = (req, res) => {
  res.redirect('/payment/failure');
};