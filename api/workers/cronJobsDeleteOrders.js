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
function startCronJobsDeleteExpireOrders() {
  const cronInterval = process.env.CRON_ORDER_DELETE_ORDERS_DAYS || '2';
  cron.schedule('* * */${cronInterval} * *', async () => {
    try {
      console.log('Running CRON job to check orders to delete expired...');      

      const expiredOrdersForDelete = await Order.findAll({
        where: {
          status: 'expired',
          createdAt: { [Op.lt]: moment().subtract(2, 'days').toDate() }
        },
      });
      if (expiredOrdersForDelete.length > 0) {
        const transaction = await sequelize.transaction();
        try {
          console.log(`Found ${expiredOrdersForDelete.length} expired orders older than 2 days. Deleting...`);
          for (const order of expiredOrdersForDelete) {
            await TransactionOrder.destroy({
              where: { orderId: order.id },
              transaction
            });            
            await order.destroy({ transaction });
            console.log(`Order ${order.id} deleted.`);
          }
          await transaction.commit();
        } catch (error) {
          await transaction.rollback();
          console.error('Failed to delete expired orders:', error);
        }
      }

    } catch (error) {
      console.error('Error in CRON job:', error);
    }
  });
}


module.exports = { startCronJobsDeleteExpireOrders };
