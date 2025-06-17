// 3. controllers/message.controller.js
const { Message } = require('../models');

exports.sendMessage = async (req, res) => {
    try {
        const { receiver_id, content, message_type } = req.body;
        const message = await Message.create({
            sender_id: req.user.id,
            receiver_id,
            content,
            message_type
        });
        res.status(201).json(message);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.getMessages = async (req, res) => {
    try {
        const { receiver_id } = req.query;
        const messages = await Message.findAll({
            where: {
                sender_id: req.user.id,
                receiver_id
            }
        });
        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
