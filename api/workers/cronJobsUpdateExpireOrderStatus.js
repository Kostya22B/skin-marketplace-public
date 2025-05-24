const cron = require('node-cron');
const sequelize = require('../db');
// const checkPaymentStatus = require('../service/freekasaService');
const Order = require('../models/orderModel');
const Cart = require('../models/cart/cartModel');
const TransactionOrder = require('../models/transactionOrderModel');
const { Op } = require('sequelize');
const moment = require('moment');

const envFile = process.env.NODE_ENV === 'uat' ? '.env.uat' : '.env';
require('dotenv').config({ path: envFile });

// Func for CRON-tasks
function startCronJobsUpdateExpireOrders() {
  const cronInterval = process.env.CRON_ORDER_UPDATE_ORDERS_STATUS_MINUTES || '2';
  cron.schedule('*/${cronInterval} * * * *', async () => {
    try {
      console.log('Running CRON job to check payment statuses and update orders to expired...');

      const orders = await Order.findAll({
        where: { status: 'awaiting payment' },
        limit: 50,
      });

      if (orders.length > 0) {
        console.log(`Checking ${orders.length} awaiting payments...`);
      }

      const expiredOrders = orders.filter(order => 
        moment(order.createdAt).add(120, 'minutes').isBefore(moment())
      );
      
      if (expiredOrders.length > 0) {
        const transaction = await sequelize.transaction();
        try {
          const expiredOrderIds = expiredOrders.map(o => o.id);
          const cartIds = expiredOrders.map(o => o.cartId);
      
          await Order.update(
            { status: 'expired' },
            { where: { id: expiredOrderIds }, transaction }
          );
      
          await Cart.update(
            { status: 'active' },
            { where: { id: cartIds }, transaction }
          );
      
          await transaction.commit();
          console.log(`Marked ${expiredOrders.length} orders as expired.`);
        } catch (error) {
          await transaction.rollback();
          console.error('Failed to mark expired orders:', error);
        }
      }

    } catch (error) {
      console.error('Error in CRON job:', error);
    }
  });
}


module.exports = { startCronJobsUpdateExpireOrders };
