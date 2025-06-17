module.exports = (sequelize, DataTypes) => {
    const Session = sequelize.define('Session', {
        student_id: DataTypes.INTEGER,
        uploader_id: DataTypes.INTEGER,
        note_id: DataTypes.INTEGER,
        requested_time: DataTypes.DATE,
        status: DataTypes.ENUM('pending', 'approved', 'declined', 'completed'),
        meeting_link: DataTypes.STRING
    });

    Session.associate = models => {
        Session.belongsTo(models.User, { foreignKey: 'student_id', as: 'student' });
        Session.belongsTo(models.User, { foreignKey: 'uploader_id', as: 'uploader' });
        Session.belongsTo(models.Note, { foreignKey: 'note_id' });
        Session.hasOne(models.CallHistory, { foreignKey: 'session_id' });
    };

    return Session;
};
  