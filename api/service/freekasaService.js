const axios = require('axios');
const crypto = require('crypto');

// Disabled because of FreeKasa config
async function checkPaymentStatus(orderId) {
  const url = 'https://api.freekassa.com/v1/orders/status';
  const shopId = process.env.MERCHANT_ID;
  const apiKey = process.env.FREEKASSA_API_KEY;
  const nonce = Date.now();

  const data = {
    shopId: parseInt(shopId, 10),
    nonce: nonce,
    orderId: orderId,
  };

  const sortedKeys = Object.keys(data).sort();
  const signString = sortedKeys.map(key => data[key]).join('|');
  const signature = crypto.createHmac('sha256', apiKey).update(signString).digest('hex');

  data.signature = signature;

  try {
    const response = await axios.post(url, data, {
      headers: { 'Content-Type': 'application/json' },
    });

    return response.data.orderStatus; // Статус заказа: 0, 1, 8, 9
  } catch (error) {
    console.error(`Error checking payment status for order ${orderId}:`, error.response?.data || error.message);
    throw new Error('Unable to fetch payment status.');
  }
}

module.exports = { checkPaymentStatus };
