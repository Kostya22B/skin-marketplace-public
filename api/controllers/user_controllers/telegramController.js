// controllers/telegramController.js
const TelegramBot = require('node-telegram-bot-api');
const User = require('../../models/userModel');
const Order = require('../../models/orderModel')
const OrderItem = require('../../models/orderItemModel')
const Product = require('../../models/shop/productModel')
const axios = require('axios');

const userCodes = new Map();

const token = process.env.TELEGRAM_API_KEY;
const bot = new TelegramBot(token, { polling: true });
const BASE_URL = process.env.BACK_END_SERVER;

const generateComplexCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let code = '';
    for (let i = 0; i < 10; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
};

const handleStartCommand = async (msg) => {
    const chatId = msg.chat.id;

    try {
        const response = await axios.post(`${BASE_URL}/api/telegram/is-linked`, {
            telegramId: chatId.toString(),
        });

        if (response.data.linked) {
            bot.sendMessage(chatId, 'Вы уже привязаны к сайту.');
            return;
        }
    } catch (error) {
        console.error('Ошибка при проверке привязки:', error);
        bot.sendMessage(chatId, 'Произошла ошибка. Попробуйте позже.');
        return;
    }

    const code = generateComplexCode();

    // console.log('Sending code to server:', { telegramId: chatId, code });

    try {
        const response = await axios.post(`${BASE_URL}/api/telegram/store-code`, {
            telegramId: chatId.toString(),
            code,
        });

        if (response.data.success) {
            bot.sendMessage(chatId, `Your code for authorization:\n\n\`\`\`\n${code}\n\`\`\``, {
                parse_mode: 'Markdown',
            });
            bot.sendMessage(chatId, 'The code has been successfully sent to the server. Enter it on the website in the profile section.');
        } else {
            bot.sendMessage(chatId, 'Error sending code to server.');
        }
    } catch (error) {
        console.error('Error sending data to server:', error);
        bot.sendMessage(chatId, 'An error has occurred. Please try again later.');
    }
};

bot.onText(/\/start/, handleStartCommand);

exports.isTelegramLinked = async (telegramId) => {
    const user = await User.findOne({ where: { telegramId } });
    return !!user;
};

exports.storeCode = async (req, res) => {
    const { telegramId, code } = req.body;

    if (!telegramId || !code) {
        return res.status(400).json({ success: false, message: 'Incorrect data' });
    }

    userCodes.set(code, telegramId);

    res.json({ success: true });
};

exports.verifyCode = async (req, res) => {
    const { code, userId } = req.body;

    if (!code || !userId) {
        return res.status(400).json({ success: false, message: 'Incorrect data' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }

    const telegramId = userCodes.get(code);
    if (!telegramId) {
        return res.json({ success: false, message: 'Invalid code or time expired' });
    }

    user.telegramId = telegramId;
    await user.save();

    req.session.user.telegramId = telegramId;
    await req.session.save();

    userCodes.delete(code);

    res.json({ success: true, telegramId: user.telegramId });
};

exports.notifyUser = async (telegramId) => {
    try {
        await bot.sendMessage(telegramId, 'You have successfully linked Telegram to your account on the site. You can additionally check the linking in the profile');
    } catch (error) {
        console.error('Error sending notification:', error);
    }
};

exports.notifyPurchase = async (userId, orderId) => {
    try {
        const user = await User.findByPk(userId);
        if (!user || !user.telegramId) {
            // console.log('User or Telegram ID not found');
            return;
        }

        const order = await Order.findOne({
            where: { id: orderId },
            include: [{ 
                model: OrderItem, 
                as: 'items',
                include: [Product] 
            }]
        });

        if (!order) {
            console.log('Order not found for ', user.telegramId);
            return;
        }

        const orderItems = order.items.map(item => {
            return `${item.Product.name_en} (x${item.quantity}) - ${item.status}`;
        }).join('\n');

        const message = `
Your order has been successfully paid!
Order ID: \`${order.id}\`
Items:
${orderItems}
Total amount: ${order.total} ${order.currency}
Order status: ${order.status}
`;

        await bot.sendMessage(user.telegramId, message, { parse_mode: 'Markdown' });
    } catch (error) {
        console.error('Error sending purchase notification:', error);
    }
};

exports.updateTelegramName = async (req, res) => {
    const { userId, telegramName } = req.body;
  
    if (!userId || !telegramName) {
      return res.status(400).json({ success: false, message: 'Неверные данные' });
    }
  
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'Пользователь не найден' });
      }
  
      user.telegramName = telegramName;
      await user.save();

      req.session.user.telegramName = telegramName;
      await req.session.save();
  
      res.json({ success: true });
    } catch (error) {
      console.error('Ошибка при обновлении Telegram никнейма:', error);
      res.status(500).json({ success: false, message: 'Ошибка при обновлении никнейма' });
    }
  };