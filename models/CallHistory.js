module.exports = (sequelize, DataTypes) => {
    const CallHistory = sequelize.define('CallHistory', {
        session_id: DataTypes.INTEGER,
        start_time: DataTypes.DATE,
        end_time: DataTypes.DATE,
        duration: {
            type: DataTypes.INTEGER, // in seconds (or you can use FLOAT for minutes)
            allowNull: true,
        },
        status: DataTypes.ENUM('completed', 'missed', 'cancelled')
    });

    CallHistory.associate = models => {
        CallHistory.belongsTo(models.Session, { foreignKey: 'session_id' });
    };

    return CallHistory;
};
