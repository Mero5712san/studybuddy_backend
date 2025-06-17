'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('NoteRatings', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      note_id: { type: Sequelize.INTEGER, references: { model: 'Notes', key: 'id' }, onDelete: 'CASCADE' },
      user_id: { type: Sequelize.INTEGER, references: { model: 'Users', key: 'id' }, onDelete: 'CASCADE' },
      rating: Sequelize.INTEGER,
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE
    });
    await queryInterface.addConstraint('NoteRatings', {
      fields: ['note_id', 'user_id'],
      type: 'unique',
      name: 'unique_note_user_rating'
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('NoteRatings');
  }
};