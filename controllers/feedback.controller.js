const { Feedback } = require('../models');

exports.getFeedbacks = async (req, res) => {
    try {
        const feedbacks = await Feedback.findAll();
        return res.status(200).json(feedbacks);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}


exports.sendFeedback = async (req, res) => {
    try {
        const { content } = req.body;
        const { id : user_id } = req.user;
        const feedback = await Feedback.create({ user_id, content });
        return res.status(201).json(feedback);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}