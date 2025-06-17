'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Notes', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      uploader_id: { type: Sequelize.INTEGER, references: { model: 'Users', key: 'id' }, onDelete: 'CASCADE' },
      title: Sequelize.STRING,
      description: Sequelize.TEXT,
      file_url: Sequelize.STRING,
      type: Sequelize.ENUM('pdf', 'image', 'other'),
      subject: Sequelize.STRING,
      semester: Sequelize.STRING,
      likes: { type: Sequelize.INTEGER, defaultValue: 0 },
      is_blocked: { type: Sequelize.BOOLEAN, defaultValue: false },
      blocked_reason: Sequelize.TEXT,
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Notes');
  }
};