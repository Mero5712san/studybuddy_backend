// 4. Migration - create-user-ratings.js
'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('UserRatings', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      rated_user_id: { type: Sequelize.INTEGER, references: { model: 'Users', key: 'id' }, onDelete: 'CASCADE' },
      rated_by_id: { type: Sequelize.INTEGER, references: { model: 'Users', key: 'id' }, onDelete: 'CASCADE' },
      rating: Sequelize.INTEGER,
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE
    });
    await queryInterface.addConstraint('UserRatings', {
      fields: ['rated_user_id', 'rated_by_id'],
      type: 'unique',
      name: 'unique_user_rater_pair'
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('UserRatings');
  }
};