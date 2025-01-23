// controllers/purchaseController.js
const Product = require('../../models/productModel');
const CoinsTransactions = require('../../models/coinsTransactionsModel')
const Cart = require('../../models/cart/cartModel');
const CartItem = require('../../models/cart/cartItemModel');
const Order = require('../../models/orderModel');
const OrderItem = require('../../models/orderItemModel');
const Coupon = require('../../models/coupons/couponModel')
const UserCoupon = require('../../models/coupons/userCouponModel')
const User = require('../../models/userModel')
const { notifyPurchase } = require('./telegramControllerUser');
const crypto = require('crypto');
require('dotenv').config();

const { MERCHANT_ID, SECRET_KEY, SECRET_KEY2 } = process.env;
const VALID_CURRENCIES = ['RUB', 'UAH', 'EUR'];

exports.initiatePurchase = async (req, res) => {
  const { cartId, totalPrice, currency } = req.body;

  if (!VALID_CURRENCIES.includes(currency)) {
    return res.status(400).json({ message: 'Invalid currency.' });
  }

  try {
    const userId = req.session.user.id;

    const cart = await Cart.findOne({ where: { id: cartId, userId } });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found.' });
    }
    if (cart.status == 'processing'){
      return res.status(409).json({message: 'You have already started buying process'})
    }
    const cartItems = await CartItem.findAll({ where: { cartId: cart.id } });
    if (cartItems.length === 0) {
      return res.status(404).json({ message: 'Cart is empty.' });
    }

    const coupon = cart.appliedCouponId
      ? await Coupon.findByPk(cart.appliedCouponId)
      : null;

    let updatedTotal = 0;

    // total price recalc
    for (const item of cartItems) {
      const product = await Product.findByPk(item.productId);
      if (!product) {
        return res.status(404).json({ message: 'Product not found.' });
      }

      const itemPrice = parseFloat(product[`price_${currency.toLowerCase()}`]);
      updatedTotal += itemPrice * item.quantity;
    }

    if (coupon) {
      updatedTotal -= (updatedTotal * coupon.discountValue) / 100;
    }

    if (Math.abs(updatedTotal - totalPrice) > 0.01) {
      return res.status(400).json({ message: 'Price mismatch detected.' });
    }

    let order = await Order.findOne({
      where: {
        cartId: cart.id,
      },
    });
    //TODO
    // check if purchase will be succesfull. For example:
    // user startes a process but freekasa awaiting real payment and get it but in the future
    if (order) {
      await OrderItem.destroy({ where: { orderId: order.id } });
      order.currency = currency;
      order.usedCouponId = coupon ? coupon.id : null;
      order.status = 'awaiting payment'
    } else {
      const generateUniqueId = () => crypto.randomUUID();
      order = await Order.create({
        id: generateUniqueId(),
        cartId: cart.id,
        userId,
        total: updatedTotal,
        currency,
        status: 'awaiting payment',
        usedCouponId: coupon ? coupon.id : null,
      });
    }

    for (const item of cartItems) {
      const product = await Product.findByPk(item.productId);
      const itemPrice = parseFloat(product[`price_${currency.toLowerCase()}`]);
      await OrderItem.create({
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
        price: itemPrice,
      });
    }
    await cart.update({ status: 'processing' });

    const amount = updatedTotal.toFixed(2);
    const signString = `${MERCHANT_ID}:${amount}:${SECRET_KEY}:${currency}:${order.id}`;
    const sign = crypto.createHash('md5').update(signString).digest('hex');
    const paymentUrl = `https://pay.freekassa.com/?m=${MERCHANT_ID}&oa=${amount}&currency=${currency}&o=${order.id}&s=${sign}`;

    res.json({ paymentUrl });
  } catch (error) {
    let order = await Order.findOne({
      where: {
        cartId: cartId,
      },
    });
    let cart = await Order.findOne({
      where: {
        cartId: cartId,
      },
    });
    await cart.update({ status: 'active' });
    await order.destroy();
    console.error("Error during purchase initiation:", error);
    res.status(500).json({ message: 'Error initiating purchase' });
  }
};


exports.handleCallback = async (req, res) => {
  const { MERCHANT_ORDER_ID, AMOUNT, SIGN } = req.body;

  try {
    const order = await Order.findOne({ where: { id: MERCHANT_ORDER_ID } });

    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    const signString = `${MERCHANT_ID}:${AMOUNT}:${SECRET_KEY2}:${order.id}`;
    const expectedSign = crypto.createHash('md5').update(signString).digest('hex');

    if (SIGN !== expectedSign) {
      return res.status(400).json({ message: 'Invalid signature.' });
    }

    const cart = await Cart.findOne({ where: { 
      id: order.cartId, 
      userId: order.userId,
      status: 'processing'
    } });
    //Временно комментируем для дальнейшего дебага
    // const status = await checkPaymentStatus(order.id);

    // if (status !== 1) {
    //   return res.status(400).json({ message: `Payment not successful. Status: ${status}` });
    // }

    if (cart && order.usedCouponId) {
      const userCoupon = await UserCoupon.create({
        userId: order.userId,
        couponId: order.usedCouponId,
        usedAt: new Date(),
      });
      await order.update({ usedCouponId: userCoupon.id });
    }
    await order.update({ status: 'paid' });
    await cart.update({status: 'delivered'});

    await notifyPurchase(order.userId, order.id);

    res.send('YES');
  } catch (error) {
    console.error('Error processing callback:', error);
    res.status(500).send('Error processing callback');
  }
};

exports.payWithCoins = async (req, res) => {
  const {cartId, totalPrice, currency} = req.body;
  if (currency!='bufferkacoin'){
    return res.status(403).json({message: 'Bad currency type'})
  }
  try {
    const cart = await Cart.findOne({ where: { id: cartId } });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    const user = await User.findOne({ where: { id: cart.userId } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const cartItems = await CartItem.findAll({ where: { cartId: cart.id } });
    if (cartItems.length === 0) {
      return res.status(404).json({ message: 'Cart is empty.' });
    }
    let updatedTotal = 0;
    for (const item of cartItems) {
      const product = await Product.findByPk(item.productId);
      if (!product) {
        return res.status(404).json({ message: 'Product not found.' });
      }

      const itemPrice = parseFloat(product[`price_${currency.toLowerCase()}`]);
      updatedTotal += itemPrice * item.quantity;
    }
    // if(totalPrice != updatedTotal){
    //   return res.status(403).json({message: 'Bad price'})
    // };
    console.log(updatedTotal, totalPrice)
    if (user.coinsBalance < updatedTotal) {
      return res.status(400).json({ message: 'Insufficient coins balance' });
    }

    user.coinsBalance -= updatedTotal;
    await user.save();

    let order = await Order.findOne({
      where: {
        cartId: cart.id,
      },
    });
    const coupon = cart.appliedCouponId
      ? await Coupon.findByPk(cart.appliedCouponId)
      : null;
    if (order) {
      await OrderItem.destroy({ where: { orderId: order.id } });
      order.currency = currency;
      order.usedCouponId = coupon ? coupon.id : null;
      order.status = 'paid'
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
      });
    }

    for (const item of cartItems) {
      const product = await Product.findByPk(item.productId);
      const itemPrice = parseFloat(product[`price_${currency.toLowerCase()}`]);
      await OrderItem.create({
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
        price: itemPrice,
      });
    }

    await CoinsTransactions.create({
      userId: cart.userId,
      type: 'spend',
      amount: -updatedTotal,
      orderId: order.id,
    });

    await order.update({ status: 'paid' });
    await cart.update({status: 'delivered'});
    let redirect = '/profile';
    res.json({ redirect });
  } catch (error) {
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