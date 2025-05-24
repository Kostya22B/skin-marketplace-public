// api/controllers/admin_coins_transactions_controller.js
const sequelize = require('../../db');
const User = require('../../models/userModel');
const AdminCoinsTransaction = require('../../models/AdminCoinsTransactionModel');

// Эндпоинт для добавления коинов пользователю
exports.addCoinsToUser = async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
    }
    try {
        if (req.session.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const { userId, coins } = req.body;
        if (!userId || !coins || isNaN(coins) || parseFloat(coins) <= 0) {
            return res.status(400).json({ message: 'Invalid parameters' });
        }

        // transaction
        const transaction = await sequelize.transaction();
        try {
            const user = await User.findByPk(userId, { transaction });
            if (!user) {
                await transaction.rollback();
                return res.status(404).json({ message: 'User not found' });
            }

            const newBalance = parseFloat(user.coinsBalance) + parseFloat(coins);
            user.coinsBalance = newBalance;
            await user.save({ transaction });

            const coinTransaction = await AdminCoinsTransaction.create({
                adminId: req.session.user.id,
                userId: user.id,
                coins: coins,
            }, { transaction });

            await transaction.commit();
            return res.status(200).json({ message: 'Coins added successfully', transaction: coinTransaction });
        } catch (error) {
            await transaction.rollback();
            console.error('Error in coin transaction:', error);
            return res.status(500).json({ message: 'Server error during coin transaction' });
        }
    } catch (error) {
        console.error('Error in addCoinsToUser:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

exports.getAdminCoinsTransactions = async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
    }
    try {
        if (req.session.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const transactions = await AdminCoinsTransaction.findAll({
            include: [
                { model: User, as: 'Admin', attributes: ['email'] },
                { model: User, as: 'User', attributes: ['email'] },
            ],
            order: [['createdAt', 'DESC']],
        });

        return res.status(200).json({ transactions });
    } catch (error) {
        console.error('Error fetching coin transactions:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

exports.searchUserByEmail = async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
    }
    try {
        if (req.session.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const { email } = req.query;
        if (!email) {
            return res.status(400).json({ message: 'Email parameter is required' });
        }

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.status(200).json({ user });
    } catch (error) {
        console.error('Error searching user:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};
