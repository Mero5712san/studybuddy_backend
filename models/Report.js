module.exports = (sequelize, DataTypes) => {
    const Report = sequelize.define('Report', {
        reporter_id: DataTypes.INTEGER,
        reported_user_id: DataTypes.INTEGER,
        reported_note_id: DataTypes.INTEGER,
        reason: DataTypes.TEXT,
        status: {
            type: DataTypes.ENUM('pending', 'reviewed', 'blocked', 'deleted'),
            defaultValue: 'reviewed'
        },
        resolved_at: DataTypes.DATE
    });

    Report.associate = models => {
        Report.belongsTo(models.User, { foreignKey: 'reporter_id', as: 'reporter' });
        Report.belongsTo(models.User, { foreignKey: 'reported_user_id', as: 'reportedUser' });
        Report.belongsTo(models.Note, { foreignKey: 'reported_note_id' });
    };

    return Report;
};




