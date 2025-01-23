// controllers/telegramController.js
const TelegramBot = require('node-telegram-bot-api');
const User = require('../../models/userModel');
const Order = require('../../models/orderModel')
const OrderItem = require('../../models/orderItemModel')
const Product = require('../../models/productModel')
const axios = require('axios');

const userCodes = new Map();

const token = process.env.TELEGRAM_API_KEY;
const bot = new TelegramBot(token, { polling: true });

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
        const response = await axios.post('/api/telegram/is-linked', {
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

    console.log('Sending code to server:', { telegramId: chatId, code });

    try {
        const response = await axios.post('/api/telegram/store-code', {
            telegramId: chatId.toString(),
            code,
        });

        if (response.data.success) {
            bot.sendMessage(chatId, `Ваш код для авторизации на сервере:\n\n\`\`\`\n${code}\n\`\`\``, {
                parse_mode: 'Markdown',
            });
            bot.sendMessage(chatId, 'Код успешно отправлен на сервер. Введите его на сайте в секции профиля.');
        } else {
            bot.sendMessage(chatId, 'Ошибка при отправке кода на сервер.');
        }
    } catch (error) {
        console.error('Ошибка при отправке данных на сервер:', error);
        bot.sendMessage(chatId, 'Произошла ошибка. Попробуйте позже.');
    }
};

// Обработка команды /start
bot.onText(/\/start/, handleStartCommand);

// Проверка, привязан ли Telegram ID
exports.isTelegramLinked = async (telegramId) => {
    const user = await User.findOne({ where: { telegramId } });
    return !!user;
};

// Сохранение кода и Telegram ID
exports.storeCode = async (req, res) => {
    const { telegramId, code } = req.body;

    if (!telegramId || !code) {
        return res.status(400).json({ success: false, message: 'Неверные данные' });
    }

    console.log('Saving code:', { telegramId, code });

    userCodes.set(code, telegramId);

    res.json({ success: true });
};

// Проверка кода
exports.verifyCode = async (req, res) => {
    const { code, userId } = req.body;

    if (!code || !userId) {
        return res.status(400).json({ success: false, message: 'Неверные данные' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
        return res.status(404).json({ success: false, message: 'Пользователь не найден' });
    }

    console.log('Verifying code:', { userId, code });

    const telegramId = userCodes.get(code);
    if (!telegramId) {
        return res.json({ success: false, message: 'Неверный код или время истекло' });
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
        await bot.sendMessage(telegramId, 'Вы успешно привязали Telegram к вашему аккаунту на сайте. Выйдите из сесси сайта и авторизуйтесь снова. Привязку можно проверить дополнительно в профиле');
    } catch (error) {
        console.error('Ошибка при отправке уведомления:', error);
    }
};

exports.notifyPurchase = async (userId, orderId) => {
    try {
        const user = await User.findByPk(userId);
        if (!user || !user.telegramId) {
            console.log('User or Telegram ID not found');
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
            console.log('Order not found');
            return;
        }

        const orderItems = order.items.map(item => {
            return `${item.Product.name} (x${item.quantity}) - ${item.status}`;
        }).join('\n');

        const message = `
Ваш заказ успешно оплачен!
ID заказа: \`${order.id}\`
Товары:
${orderItems}
Итоговая сумма: ${order.total} ${order.currency}
Статус заказа: ${order.status}
        `;

        await bot.sendMessage(user.telegramId, message, { parse_mode: 'Markdown' });
    } catch (error) {
        console.error('Ошибка при отправке уведомления о покупке:', error);
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