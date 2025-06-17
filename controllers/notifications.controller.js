const { Notification } = require('../models');

exports.getNotifications = async (req, res) => {
    try {
        const { id: user_id } = req.user;
        const notifications = await Notification.findAll({
            where: { user_id },
            order: [['createdAt', 'DESC']]
        });
        res.status(200).json(notifications);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


exports.pushNotification = async (req, res) => {
    try {
        const { user_id, content } = req.body;
        const notification = await Notification.create({ user_id, content });
        res.status(201).json(notification);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}

exports.readNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const notification = await Notification.findByPk(id);
        if (!notification) {
            return res.status(404).json({ error: 'Notification not found' });
        }
        await notification.update({ read: true });
        res.status(200).json({ message: 'Notification marked as read' });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}