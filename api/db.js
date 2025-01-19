// api/db.js
const { Sequelize } = require('sequelize');

require('dotenv').config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    // dialectOptions: {
    //     ssl: {
    //         rejectUnauthorized: true,
    //         ca: process.env.DB_CERTIFICATE
    //     }
    // },
    logging: true,
});

module.exports = sequelize;
