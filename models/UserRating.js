module.exports = (sequelize, DataTypes) => {
    const UserRating = sequelize.define('UserRating', {
        rated_user_id: DataTypes.INTEGER,
        rated_by_id: DataTypes.INTEGER,
        rating: DataTypes.INTEGER
    }, {
        indexes: [
            {
                unique: true,
                fields: ['rated_user_id', 'rated_by_id']
            }
        ]
    });

    UserRating.associate = models => {
        UserRating.belongsTo(models.User, { foreignKey: 'rated_user_id', as: 'ratedUser' });
        UserRating.belongsTo(models.User, { foreignKey: 'rated_by_id', as: 'rater' });
    };

    return UserRating;
  };