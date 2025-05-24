// controllers/orderController.js
const Cart = require('../../models/cart/cartModel');
const CartItem = require('../../models/cart/cartItemModel');
const Order = require('../../models/orderModel');
const OrderItem = require('../../models/orderItemModel');
const Product = require('../../models/shop/productModel');
const UserCoupon = require('../../models/coupons/userCouponModel');
const User = require('../../models/userModel');
const Coupon = require('../../models/coupons/couponModel');
const { Op } = require('sequelize');

exports.createOrder = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const currency = req.session.user.currency;
        const cart = await Cart.findOne({ where: { userId, status: 'active' } });

        if (!cart) {
            return res.status(404).json({ message: 'Cart is empty.' });
        }

        const cartItems = await CartItem.findAll({ where: { cartId: cart.id } });

        if (cartItems.length === 0) {
            return res.status(404).json({ message: 'Cart is empty.' });
        }

        let total = 0;
        const order = await Order.create({ userId, currency, total, status: 'pending' });

        for (const item of cartItems) {
            const product = await Product.findByPk(item.productId);
            if (product) {
                total += product.price * item.quantity;
                await OrderItem.create({
                    orderId: order.id,
                    productId: product.id,
                    quantity: item.quantity,
                });
            }
        }

        order.total = total;
        await order.save();

        // Обновляем статус корзины
        cart.status = 'ordered';
        await cart.save();

        res.status(200).json({ message: 'Order created successfully', order });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getOrderDetails = async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await Order.findByPk(orderId, {
            include: [{ model: OrderItem, as: 'items' }],
          });          

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.status(200).json(order);
    } catch (error) {
        console.error('Error fetching order details:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// controllers/orderController.js
exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const orders = await Order.findAll({
      where: { userId },
      order: [['updatedAt', 'DESC']],
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [{ model: Product, attributes: ['name', 'description'] }],
        },
        {
          model: Coupon,
          as: 'appliedCoupon',
          attributes: ['code', 'discountValue'],
        },
      ],
    });

    const detailedOrders = orders.map(order => ({
      id: order.id,
      total: order.total,
      status: order.status,
      updatedAt: order.updatedAt,
      currency: order.currency,
      coupon: order.appliedCoupon ? {
        code: order.appliedCoupon.code,
        discountValue: order.appliedCoupon.discountValue,
      } : null,
      items: order.items.map(item => ({
        name: item.Product.name,
        description: item.Product.description,
        quantity: item.quantity,
        status: item.status,
      })),
    }));

    res.status(200).json({ orders: detailedOrders });
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
