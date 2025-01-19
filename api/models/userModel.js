// api/models/userModel.js
const { DataTypes } = require('sequelize');
const sequelize = require('../db');

// Define the User model
const User = sequelize.define('User', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    picture: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    googleId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    coinsBalance: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
    },
    telegramId: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
    },
    telegramName: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    role: {
        type: DataTypes.ENUM,
        values: ['user', 'admin', 'god'],
        defaultValue: 'user',
    },
}, {
    // Model options
    timestamps: true,
    tableName: 'users',
});

module.exports = User;
