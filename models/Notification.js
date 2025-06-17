module.exports = (sequelize, DataTypes) => {
    const Notification = sequelize.define('Notification', {
        user_id: DataTypes.INTEGER,
        content: DataTypes.STRING,
        read: { type: DataTypes.BOOLEAN, defaultValue: false }
    });

    Notification.associate = models => {
        Notification.belongsTo(models.User, { foreignKey: 'user_id' });
    };

    return Notification;
  };