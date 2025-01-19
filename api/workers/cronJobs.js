const cron = require('node-cron');
// const checkPaymentStatus = require('../service/freekasaService');
const  Order  = require('../models/orderModel');
const  Cart  = require('../models/cart/cartModel');
const moment = require('moment');

// Func for CRON-tasks
function startCronJobs() {
  cron.schedule('*/15 * * * *', async () => {
    try {
      console.log('Running CRON job to check payment statuses...');
      const orders = await Order.findAll({
        where: { status: 'awaiting payment' },
      });

      for (const order of orders) {
        // const status = await checkPaymentStatus(order.id);

        if (moment(order.createdAt).add(15, 'minutes').isBefore(moment())) {
          let cart = await Cart.findOne({
            where: {
              cartId: order.cartId,
            },
          });
          await cart.update({ status: 'active' });
          await order.update({ status: 'expired' });
          console.log(`Order ${order.id} marked as expired.`);
        }
      }
    } catch (error) {
      console.error('Error in CRON job:', error);
    }
  });
}

module.exports = { startCronJobs };
