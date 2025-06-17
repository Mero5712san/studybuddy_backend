// 6. Migration - create-community-answers.js
'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('CommunityAnswers', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      question_id: { type: Sequelize.INTEGER, references: { model: 'CommunityQuestions', key: 'id' }, onDelete: 'CASCADE' },
      user_id: { type: Sequelize.INTEGER, references: { model: 'Users', key: 'id' }, onDelete: 'CASCADE' },
      answer: Sequelize.TEXT,
      likes: { type: Sequelize.INTEGER, defaultValue: 0 },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('CommunityAnswers');
  }
};
