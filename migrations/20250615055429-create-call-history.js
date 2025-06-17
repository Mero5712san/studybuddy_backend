// 9. Migration - create-call-history.js
'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('CallHistories', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      session_id: { type: Sequelize.INTEGER, references: { model: 'Sessions', key: 'id' }, onDelete: 'CASCADE' },
      start_time: Sequelize.DATE,
      end_time: Sequelize.DATE,
      duration: { type: Sequelize.INTEGER, allowNull: true },
      status: Sequelize.ENUM('completed', 'missed', 'cancelled'),
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('CallHistories');
  }
};