// controllers/couponController.js
const Coupon = require('../models/coupons/couponModel');
const UserCoupon = require('../models/coupons/userCouponModel');
const Cart = require('../models/cart/cartModel');
const { Op } = require('sequelize');


exports.applyCoupon = async (req, res) => {
  try {
    const { code, cartId } = req.body;
    const userId = req.session.user.id;

    const coupon = await Coupon.findOne({
      where: { code, isActive: true, expirationDate: { [Op.gte]: new Date() } },
    });

    if (!coupon) {
      return res.status(404).json({ message: 'Купон недействителен или истек.' });
    }

    const alreadyUsed = await UserCoupon.findOne({
      where: { userId, couponId: coupon.id },
    });

    if (alreadyUsed) {
      return res.status(400).json({ message: 'Купон уже использован вами.' });
    }

    const cart = await Cart.findOne({ where: { id: cartId, userId } });

    if (!cart) {
      return res.status(404).json({ message: 'Корзина не найдена.' });
    }

    cart.appliedCouponId = coupon.id;
    await cart.save();

    res.status(200).json({ discount: coupon.discountValue });
  } catch (error) {
    console.error('Ошибка применения купона:', error);
    res.status(500).json({ message: 'Внутренняя ошибка сервера.' });
  }
};