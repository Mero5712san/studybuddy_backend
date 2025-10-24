module.exports = (sequelize, DataTypes) => {
    const CommunityAnswer = sequelize.define('CommunityAnswer', {
        question_id: DataTypes.INTEGER,
        user_id: DataTypes.INTEGER,
        answer: DataTypes.TEXT,
        likes: { type: DataTypes.INTEGER, defaultValue: 0 }
    });

    CommunityAnswer.associate = models => {
        CommunityAnswer.belongsTo(models.CommunityQuestion, { foreignKey: 'question_id' });
        CommunityAnswer.belongsTo(models.User, { foreignKey: 'user_id' });
    };

    return CommunityAnswer;
};
