// api/db.js
const { Sequelize } = require('sequelize');

// db.js

const envFile = process.env.NODE_ENV === 'uat' ? '.env.uat' : '.env';
require('dotenv').config({ path: envFile });


const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    dialectOptions: {
        ssl: {
            rejectUnauthorized: true,
            ca: process.env.DB_CERTIFICATE
        }
    },
    logging: true,
});

module.exports = sequelize;
