module.exports = (sequelize, DataTypes) => {
    const Note = sequelize.define('Note', {
        uploader_id: DataTypes.INTEGER,
        title: DataTypes.STRING,
        description: DataTypes.TEXT,
        file_url: DataTypes.STRING,
        type: DataTypes.ENUM('pdf', 'image', 'other'),
        subject: DataTypes.STRING,
        semester: DataTypes.STRING,
        likes: { type: DataTypes.INTEGER, defaultValue: 0 },
        is_blocked: { type: DataTypes.BOOLEAN, defaultValue: false },
        blocked_reason: DataTypes.TEXT
    });

    Note.associate = models => {
        Note.belongsTo(models.User, { foreignKey: 'uploader_id' });
        Note.hasMany(models.NoteRating, { foreignKey: 'note_id' });
        Note.hasMany(models.Session, { foreignKey: 'note_id' });
        Note.hasMany(models.Report, { foreignKey: 'reported_note_id' });
    };

    return Note;
  };