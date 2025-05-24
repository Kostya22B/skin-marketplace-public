// shopModel.js
const { DataTypes } = require('sequelize');
const sequelize = require('../../db');

const Shop = sequelize.define('Shop', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    description: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    name_en: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
    },
    description_en: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    nameLink: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    
    picture: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'https://cdn.vectorstock.com/i/500p/32/45/no-image-symbol-missing-available-icon-gallery-vector-45703245.jpg',
        validate: {
            isUrl: true,
        }
    },
    status: {
        type: DataTypes.ENUM,
        values: ['active', 'disabled', 'is_archived'],
        defaultValue: 'active',
    },
}, {
    timestamps: true,
    tableName: 'shops',
});


module.exports = Shop;