// server.js

const express = require('express');
const cors = require('cors');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const app = express();
const sequelize = require('./db');
const path = require('path');
const { startCronJobs } = require('./workers/cronJobs');


require('dotenv').config();
require('./models/associations');

// Sync all models with the database
sequelize.sync({ force: false }).then(() => {
}).catch((error) => {
    console.error('Unable to connect to the database:', error);
});
sequelize.sync({ alter: true }).then(() => {
    console.log('Database synchronized successfully with purchase');
  }).catch((error) => {
    console.error('Error synchronizing database:', error);
  });

// Middleware
app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: '',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  }));
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


// Importing routes
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

startCronJobs();
// Starting the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
