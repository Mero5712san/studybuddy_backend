// 7. Migration - create-sessions.js
'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Sessions', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      student_id: { type: Sequelize.INTEGER, references: { model: 'Users', key: 'id' }, onDelete: 'CASCADE' },
      uploader_id: { type: Sequelize.INTEGER, references: { model: 'Users', key: 'id' }, onDelete: 'CASCADE' },
      note_id: { type: Sequelize.INTEGER, references: { model: 'Notes', key: 'id' }, onDelete: 'CASCADE' },
      requested_time: Sequelize.DATE,
      status: Sequelize.ENUM('pending', 'approved', 'declined', 'completed'),
      meeting_link: Sequelize.STRING,
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Sessions');
  }
};