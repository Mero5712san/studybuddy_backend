module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        name: DataTypes.STRING,
        email: { type: DataTypes.STRING, unique: true },
        password: DataTypes.STRING,
        role: DataTypes.ENUM('student', 'uploader', 'both'),
        profile_picture: DataTypes.STRING,
        bio: DataTypes.TEXT,
        contact_number: DataTypes.STRING,
        rating: DataTypes.FLOAT,
        is_blocked: { type: DataTypes.BOOLEAN, defaultValue: false },
        blocked_until: DataTypes.DATE
    });

    User.associate = models => {
        User.hasMany(models.Note, { foreignKey: 'uploader_id' });
        User.hasMany(models.NoteRating, { foreignKey: 'user_id' });
        User.hasMany(models.UserRating, { foreignKey: 'rated_by_id' });
        User.hasMany(models.CommunityQuestion, { foreignKey: 'user_id' });
        User.hasMany(models.CommunityAnswer, { foreignKey: 'user_id' });
        User.hasMany(models.Session, { foreignKey: 'student_id' });
        User.hasMany(models.Session, { foreignKey: 'uploader_id' });
        User.hasMany(models.Message, { foreignKey: 'sender_id' });
        User.hasMany(models.Message, { foreignKey: 'receiver_id' });
        User.hasMany(models.Notification, { foreignKey: 'user_id' });
        User.hasMany(models.Feedback, { foreignKey: 'user_id' });
        User.hasMany(models.Report, { foreignKey: 'reporter_id' });
        User.hasMany(models.Report, { foreignKey: 'reported_user_id' });
    };

    return User;
};