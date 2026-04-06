require('dotenv').config();

const Sequelize = require('sequelize');

const database = process.env.DB_DATABASE || process.env.DB_NAME;
const port = Number(process.env.DB_PORT || 3306);

const sequelize = new Sequelize(
    database,
    process.env.DB_USERNAME,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port,
        dialect: 'mysql',
    }
);

module.exports = sequelize;
