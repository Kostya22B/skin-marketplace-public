const TelegramBot = require('node-telegram-bot-api');
const User = require('../../models/userModel');
const Order = require('../../models/orderModel');
const OrderItem = require('../../models/orderItemModel');
const Product = require('../../models/shop/productModel');
const { Op } = require('sequelize');
const envFile = process.env.NODE_ENV === 'uat' ? '.env.uat' : '.env';
require('dotenv').config({ path: envFile });


const token = process.env.TELEGRAM_API_KEY_ADMIN;
const bot = new TelegramBot(token, { polling: true });

// User role check
const isAdmin = async (chatId) => {
    const user = await User.findOne({ where: { telegramId: chatId.toString() } });
    return user && user.role === 'admin';
};

bot.onText(/\/today_orders/, async (msg) => {
    const chatId = msg.chat.id;
    if (!(await isAdmin(chatId))) {
        bot.sendMessage(chatId, 'У вас нет прав для выполнения этой команды.');
        return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    try {
        const orders = await Order.findAll({
            where: {
                status: 'paid',
                createdAt: {
                    [Op.gte]: today,
                },
            },
            include: [
                {
                    model: User,
                    as: 'User',
                    attributes: ['email', 'telegramName'],
                },
            ],
            limit: 10,
        });

        if (orders.length === 0) {
            bot.sendMessage(chatId, 'Сегодня нет заказов со статусом "paid".');
            return;
        }

        const ordersList = orders.map((order, index) => {
            const orderId = escapeMarkdownV2(order.id.toString());
            const email = escapeMarkdownV2(order.User.email);
            const orderStatus = escapeMarkdownV2(order.status.toString());
            const telegramName = order.User.telegramName
                ? escapeMarkdownV2(order.User.telegramName)
                : 'Не указан';
        
            return `${index + 1} Заказ ID:\n\n\`\`\`\n${orderId}\n\`\`\`\n` +
                   `Почта: ${email}\n` +
                   `Status: ${orderStatus}\n` +
                   `Telegram: ${telegramName}`;
        }).join('\n\n');

        bot.sendMessage(chatId, `Сегодняшние заказы:\n\n${ordersList}`, {
            parse_mode: 'MarkdownV2',
        });
    } catch (error) {
        console.error('Ошибка при получении заказов:', error);
        bot.sendMessage(chatId, 'Произошла ошибка при обработке вашего запроса.');
    }
});

function escapeMarkdownV2(text) {
    return text.replace(/[_*[\]()~`>#+\-=|{}.!\\]/g, '\\$&');
}


bot.onText(/\/order_details ([a-fA-F0-9\-]+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const orderId = match[1];

    if (!(await isAdmin(chatId))) {
        bot.sendMessage(chatId, 'У вас нет прав для выполнения этой команды.');
        return;
    }

    const order = await Order.findOne({
        where: { id: orderId },
        include: [
            {
                model: User,
                as: 'User',
                attributes: ['email', 'telegramName'],
            },
            {
                model: OrderItem,
                as: 'items',
                include: [Product],
            },
        ],
    });

    if (!order) {
        bot.sendMessage(chatId, 'Заказ не найден.');
        return;
    }

    const orderDetails = `
Заказ ID: ${order.id}
Почта: ${order.User.email}
Telegram: ${order.User.telegramName || 'Не указан'}
Товары:
${order.items.map(item => `${item.Product.name} (x${item.quantity}) - ${item.status}`).join('\n')}
Итоговая сумма: ${order.total} ${order.currency}
Статус заказа: ${order.status}
  `;

    const options = {
        reply_markup: {
            inline_keyboard: [
                [
                    { text: 'В обработке', callback_data: `set_status_processing_${order.id}` },
                    { text: 'Доставлен', callback_data: `set_status_delivered_${order.id}` },
                ],
            ],
        },
    };

    bot.sendMessage(chatId, orderDetails, options);
});

bot.on('callback_query', async (callbackQuery) => {
    const chatId = callbackQuery.message.chat.id;
    const data = callbackQuery.data;

    const [action, status, orderId] = data.split('_');

    if (!(await isAdmin(chatId))) {
        bot.sendMessage(chatId, 'У вас нет прав для выполнения этой команды.');
        return;
    }

    if (action === 'set' && status === 'status') {
        if (!orderId || !orderId.match(/^[a-fA-F0-9\-]{36}$/)) {
            bot.sendMessage(chatId, 'Некорректный ID заказа.');
            return;
        }

        const order = await Order.findByPk(orderId);
        if (!order) {
            bot.sendMessage(chatId, 'Заказ не найден.');
            return;
        }

        order.status = status === 'processing' ? 'processing after payment' : 'delivered';
        await order.save();

        bot.sendMessage(chatId, `Статус заказа ${order.id} изменен на "${order.status}".`);
    }
});

bot.on('polling_error', (error) => {
    console.error('Polling error:', error);
});