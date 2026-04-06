'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const allConfigs = require(__dirname + '/../config/config.json');
const envDatabase = process.env.DB_DATABASE || process.env.DB_NAME;
const envPort = Number(process.env.DB_PORT || 3306);

function getEnvConfig() {
  if (process.env.DATABASE_URL) {
    return {
      use_env_variable: 'DATABASE_URL',
      dialect: process.env.DB_DIALECT || 'mysql',
      logging: false,
    };
  }

  if (
    envDatabase &&
    process.env.DB_USERNAME &&
    process.env.DB_HOST
  ) {
    return {
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD || null,
      database: envDatabase,
      host: process.env.DB_HOST,
      port: envPort,
      dialect: process.env.DB_DIALECT || 'mysql',
      logging: false,
    };
  }

  return null;
}

const config = allConfigs[env] || getEnvConfig() || allConfigs.development;

if (!config) {
  throw new Error(
    `No database configuration found for NODE_ENV="${env}". ` +
    'Add an environment section in config/config.json or set DB_DATABASE/DB_NAME, DB_USERNAME, and DB_HOST (or DATABASE_URL).'
  );
}
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
