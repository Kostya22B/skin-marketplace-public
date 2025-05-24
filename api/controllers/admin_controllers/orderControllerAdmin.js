// controllers/admin_controllers/orderControllerAdmin.js

const Order = require('../../models/orderModel');
const OrderItem = require('../../models/orderItemModel');
const Product = require('../../models/shop/productModel');
const User = require('../../models/userModel');
const Coupon = require('../../models/coupons/couponModel');
const TransactionOrder = require('../../models/transactionOrderModel');
const ExcelJS = require('exceljs');
const { Op } = require('sequelize');

exports.getAllOrders = async (req, res) => {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied' });
  }
  //it can filter by email/orderId
  try {
    const { search, page = 1, limit = 6 } = req.query;
    const offset = (page - 1) * limit;

    const userRole = req.session.user.role;
    if (userRole !== 'admin') {
      return res.status(403).json({ message: 'You are not an admin' });
    }

    let whereCondition = {};
    let includeOptions = [
      {
        model: OrderItem,
        as: 'items',
        include: [{
          model: Product,
          attributes: ['name']
        }]
      },
      {
        model: User,
        as: 'User',
        attributes: ['name', 'email', 'telegramId', 'telegramName'],
        required: !!search // Force INNER JOIN if searching by email
      },
      {
        model: Coupon,
        as: 'appliedCoupon',
        attributes: ['code', 'discountValue']
      }
    ];

    if (search) {
      const isUUID = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(search);

      if (isUUID) {
        whereCondition.id = search;
      } else if (!isNaN(search)) {
        whereCondition.id = parseInt(search, 10);
      } else {
        whereCondition['$User.email$'] = search;
      }
    }

    const orders = await Order.findAndCountAll({
      where: whereCondition,
      include: includeOptions,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit, 10),
      offset: offset
    });

    res.status(200).json({
      orders: orders.rows,
      total: orders.count,
      page: parseInt(page, 10),
      totalPages: Math.ceil(orders.count / limit)
    });
  } catch (error) {
    console.error('Ошибка при получении всех заказов:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

exports.updateOrderStatus = async (req, res) => {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied' });
  }
  try {
    const { orderId, newStatus } = req.body;
    const adminId = req.session.user.id;

    if (req.session.user.role !== 'admin') {
      return res.status(403).json({ message: 'You are not authorized to perform this action' });
    }

    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const previousStatus = order.status;

    order.status = newStatus;
    await order.save();

    await TransactionOrder.create({
      adminId,
      orderId,
      previousStatus,
      newStatus,
    });

    res.status(200).json({ message: 'Order status updated successfully', order });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.exportOrdersToExcel = async (req, res) => {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied' });
  }

  try {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const orders = await Order.findAll({
      where: { 
        createdAt: { [Op.gte]: oneMonthAgo },
        status: {
          [Op.in]: ['paid', 'processing after payment', 'delivered']
        }
      },      
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [{ model: Product }]
        },
        {
          model: User,
          as: 'User',
          attributes: ['email']
        },
        {
          model: Coupon,
          as: 'appliedCoupon',
          attributes: ['code', 'discountValue']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Orders');

    worksheet.columns = [
      { header: 'Order ID', key: 'orderId', width: 36 },
      { header: 'User Email', key: 'email', width: 30 },
      { header: 'Product Names', key: 'products', width: 50 },
      { header: 'Total', key: 'total', width: 15 },
      { header: 'Currency', key: 'currency', width: 10 },
      { header: 'Coupon', key: 'coupon', width: 20 },
      { header: 'Date', key: 'createdAt', width: 20 }
    ];

    for (const order of orders) {
      worksheet.addRow({
        orderId: order.id,
        email: order.User?.email || '',
        products: order.items.map(i => `${i.Product?.name || '❓'} (x${i.quantity})`).join('\n'),
        total: parseFloat(order.total),
        currency: order.currency,
        coupon: order.appliedCoupon ? `${order.appliedCoupon.code} (-${order.appliedCoupon.discountValue}%)` : '',
        createdAt: new Date(order.createdAt).toLocaleString()
      });
      
    }
    worksheet.getColumn('products').alignment = { wrapText: true };

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=purchases_report.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Ошибка экспорта заказов в Excel:', error);
    res.status(500).json({ message: 'Ошибка сервера при экспорте' });
  }
};