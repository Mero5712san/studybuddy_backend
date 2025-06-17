module.exports = (sequelize, DataTypes) => {
    const CommunityQuestion = sequelize.define('CommunityQuestion', {
        user_id: DataTypes.INTEGER,
        title: DataTypes.STRING,
        content: DataTypes.TEXT,
        likes: { type: DataTypes.INTEGER, defaultValue: 0 }
    });

    CommunityQuestion.associate = models => {
        CommunityQuestion.belongsTo(models.User, { foreignKey: 'user_id' });
        CommunityQuestion.hasMany(models.CommunityAnswer, { foreignKey: 'question_id' });
    };

    return CommunityQuestion;
  };