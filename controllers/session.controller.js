// 4. controllers/session.controller.js
const { Session, User } = require('../models');

exports.requestSession = async (req, res) => {
    try {
        const { uploader_id, note_id, requested_time } = req.body;
        const session = await Session.create({
            student_id: req.user.id,
            uploader_id,
            note_id,
            requested_time,
            status: 'pending'
        });
        res.status(201).json(session);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.updateSession = async (req, res) => {
    try {
        const { status, meeting_link } = req.body;
        const session = await Session.findByPk(req.params.id);
        if (!session) return res.status(404).json({ error: 'Session not found' });
        session.status = status;
        if (meeting_link) session.meeting_link = meeting_link;
        await session.save();
        res.status(201).json(session);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.getSessions = async (req, res) => {
    try {
        const { id } = req.user;

        const sessions = await Session.findAll({
            where: { student_id: id },
            order: [['requested_time', 'DESC']],
            include: [
                {
                    model: User,
                    as: 'uploader',
                    attributes: ['id', 'name', 'email', 'profile_picture']
                }
            ]
        });

        res.status(200).json(sessions);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};
