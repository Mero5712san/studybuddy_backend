module.exports = (sequelize, DataTypes) => {
    const Feedback = sequelize.define('Feedback', {
        user_id: DataTypes.INTEGER,
        content: DataTypes.TEXT
    });

    Feedback.associate = models => {
        Feedback.belongsTo(models.User, { foreignKey: 'user_id' });
    };

    return Feedback;
};

