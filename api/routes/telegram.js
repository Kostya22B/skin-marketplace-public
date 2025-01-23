// routes/telegram.js
const express = require('express');
const router = express.Router();
const { isTelegramLinked, storeCode, verifyCode, notifyUser, updateTelegramName } = require('../controllers/user_controllers/telegramControllerUser');
require('../controllers/admin_controllers/telegramControllerAdmin');

router.post('/is-linked', async (req, res) => {
    const { telegramId } = req.body;

    if (!telegramId) {
        return res.status(400).json({ success: false, message: 'Неверные данные' });
    }

    const linked = await isTelegramLinked(telegramId);
    res.json({ linked });
});

router.post('/store-code', storeCode);

router.post('/verify-code', verifyCode);

router.post('/notify-user', async (req, res) => {
    const { telegramId } = req.body;

    if (!telegramId) {
        return res.status(400).json({ success: false, message: 'Неверные данные' });
    }

    await notifyUser(telegramId);
    res.json({ success: true });
});

router.post('/update-telegram-name', updateTelegramName);

module.exports = router;