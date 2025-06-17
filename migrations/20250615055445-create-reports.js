
// 12. Migration - create-reports.js
'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Reports', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      reporter_id: { type: Sequelize.INTEGER, references: { model: 'Users', key: 'id' }, onDelete: 'CASCADE' },
      reported_user_id: { type: Sequelize.INTEGER, references: { model: 'Users', key: 'id' }, onDelete: 'CASCADE' },
      reported_note_id: { type: Sequelize.INTEGER, references: { model: 'Notes', key: 'id' }, onDelete: 'CASCADE' },
      reason: Sequelize.TEXT,
      status: { type: Sequelize.ENUM('pending', 'reviewed', 'blocked', 'deleted'), defaultValue: 'reviewed' },
      resolved_at: Sequelize.DATE,
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Reports');
  }
};
