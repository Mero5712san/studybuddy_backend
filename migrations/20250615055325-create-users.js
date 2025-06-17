'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Users', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      name: Sequelize.STRING,
      email: { type: Sequelize.STRING, unique: true },
      password: Sequelize.STRING,
      role: Sequelize.ENUM('student', 'uploader', 'both'),
      profile_picture: Sequelize.STRING,
      bio: Sequelize.TEXT,
      contact_number: Sequelize.STRING,
      rating: Sequelize.FLOAT,
      is_blocked: { type: Sequelize.BOOLEAN, defaultValue: false },
      blocked_until: Sequelize.DATE,
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Users');
  }
};