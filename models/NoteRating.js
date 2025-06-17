module.exports = (sequelize, DataTypes) => {
    const NoteRating = sequelize.define('NoteRating', {
        note_id: DataTypes.INTEGER,
        user_id: DataTypes.INTEGER,
        rating: DataTypes.INTEGER
    }, {
        indexes: [
            {
                unique: true,
                fields: ['note_id', 'user_id']
            }
        ]
    });

    NoteRating.associate = models => {
        NoteRating.belongsTo(models.Note, { foreignKey: 'note_id' });
        NoteRating.belongsTo(models.User, { foreignKey: 'user_id' });
    };

    return NoteRating;
};