const express = require('express');
const cors = require('cors');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const sequelize = require('./db');
const path = require('path');
const { startCronJobsUpdateExpireOrders } = require('./workers/cronJobsUpdateExpireOrderStatus');
const { startCronJobsDeleteExpireOrders } = require('./workers/cronJobsDeleteOrders');

const envFile = process.env.NODE_ENV === 'uat' ? '.env.uat' : '.env';
require('dotenv').config({ path: envFile });

require('./models/associations');

sequelize.sync({ alter: true }).then(() => {
    console.log('Database synchronized successfully');
}).catch((error) => {
    console.error('Error synchronizing database:', error);
});

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('trust proxy', 1);
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: new SequelizeStore({
        db: sequelize,
    }),
    cookie: { 
        secure: true,
        httpOnly: true,
        sameSite: 'None',
        maxAge: 60 * 60 * 1000
    },
}));

app.get('/api/user', (req, res) => {
    if (req.session && req.session.user) {
        res.json(req.session.user);
    } else {
        res.status(401).json({ message: 'Unauthorized' });
    }
});

const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);
const cartRoutes = require('./routes/cart');
app.use('/cart', cartRoutes);
const purchaseRoutes = require('./routes/purchase');
app.use('/purchase', purchaseRoutes);
const productRoutes = require('./routes/products');
app.use('/products', productRoutes);
const orderRoutes = require('./routes/order');
app.use('/orders', orderRoutes);
const telegramRoutes = require('./routes/telegram');
app.use('/api/telegram', telegramRoutes);

const userShopRoutes = require('./routes/user/shop/shop');
app.use('/user/shops', userShopRoutes);
const userShopCategoryRoutes = require('./routes/user/shop/categories');
app.use('/user/categories', userShopCategoryRoutes);
const userShopProductRoutes = require('./routes/user/shop/products');
app.use('/user/products', userShopProductRoutes);

//admin endpoints
const shopShopRoutes = require('./routes/admin/shop/shop');
app.use('/admin/shop', shopShopRoutes);
const shopCategoryRoutes = require('./routes/admin/shop/categories');
app.use('/admin/categories', shopCategoryRoutes);
const shopProductRoutes = require('./routes/admin/shop/products');
app.use('/admin/products', shopProductRoutes);


const adminCoinsRoutes = require('./routes/adminCoinsTransactionsRoutes');
app.use('/coins/admin', adminCoinsRoutes);

startCronJobsUpdateExpireOrders();
startCronJobsDeleteExpireOrders();
const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});