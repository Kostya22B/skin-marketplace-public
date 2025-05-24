//controllers/admin_controllers/cartControllerAdmin.js

const Cart = require('../../models/cart/cartModel');
const CartItem = require('../../models/cart/cartItemModel');
const Product = require('../../models/shop/productModel');
const Order = require('../../models/orderModel');
const { Op } = require('sequelize');
const sequelize = require('../../db');

exports.getAllProcessingCarts = async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
    }
    try {
        if (req.session.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const { search } = req.query;
        let whereCondition = { status: 'processing' };
        let includeOptions = [];

        if (search) {
            includeOptions.push({
                model: User,
                as: 'User',
                attributes: ['email'],
                where: { email: { [Op.iLike]: `%${search}%` } },
                required: true
            });
        }

        const carts = await Cart.findAll({
            where: whereCondition,
            include: [
                ...includeOptions,
                {
                    model: CartItem,
                    as: 'items',
                    include: [{
                        model: Product,
                        attributes: ['name']
                    }]
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json({ carts });
    } catch (error) {
        console.error('Error fetching processing carts:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateCartStatus = async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
    }
    const transaction = await sequelize.transaction();
    try {
        if (req.session.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const { cartId, newStatus } = req.body;
        const cart = await Cart.findByPk(cartId, { transaction });
        if (!cart || cart.status !== 'processing') {
            await transaction.rollback();
            return res.status(404).json({ message: 'Cart not found or not in processing state' });
        }

        if (newStatus === 'active') {
            await Order.destroy({ where: { cartId }, transaction });
        } else if (newStatus === 'delivered') {
            await Order.update({ status: 'paid' }, { where: { cartId }, transaction });
        }

        cart.status = newStatus;
        await cart.save({ transaction });
        await transaction.commit();

        res.status(200).json({ message: 'Cart status updated successfully' });
    } catch (error) {
        console.error('Error updating cart status:', error);
        await transaction.rollback();
        res.status(500).json({ message: 'Server error' });
    }
};