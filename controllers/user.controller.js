const { User, UserRating, sequelize, Report } = require('../models');
const jwt = require('jsonwebtoken');

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({ where: { is_blocked: false } });
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
exports.getCurrentUser = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findByPk(decoded.id, {
            attributes: { exclude: ['password'] }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json(user);
    } catch (err) {
        console.error('JWT Error:', err);
        res.status(401).json({ error: 'Invalid or expired token' });
    }
};

exports.getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findOne({ where: { id, is_blocked: false } }); //   fixed
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


exports.updateUser = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ where: { email, is_blocked: false } });
        if (!(user)) {
            return res.status(404).json({ error: 'User not found' });
        }
        const updateuser = await {
            name: req.body.name || user.name,
            role: req.body.role || user.role,
            profile_picture: req.body.profile_picture || user.profile_picture,
            bio: req.body.bio || user.bio,
            contact_number: req.body.contact_number || user.contact_number,
        }
        await user.update(updateuser);
        res.status(200).json({ message: "user details updated successfully", user });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}

exports.rateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { rating } = req.body;

        const user = await User.findByPk(id);

        if (!user || user.is_blocked) {
            return res.status(404).json({ error: 'User not found' });
        }

        const rated_user_id = user.id;
        const rated_by_id = req.user.id;

        const existingRating = await UserRating.findOne({
            where: { rated_user_id, rated_by_id }
        });

        if (existingRating) {
            return res.status(400).json({ error: "You have already rated this user" });
        }

        const newRating = await UserRating.create({
            rated_user_id,
            rated_by_id,
            rating
        });

        const average = await UserRating.findOne({
            where: { rated_user_id },
            attributes: [[sequelize.fn('AVG', sequelize.col('rating')), 'avg_rating']],
            raw: true
        });

        const average_rating = parseFloat(average.avg_rating || 0).toFixed(2);
        user.rating = average_rating;
        await user.save();

        res.status(201).json({
            message: "Rating added successfully",
            rating: newRating
        });

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};



exports.reportUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const user = await User.findOne({ where: { id, is_blocked: false } }); //   fixed
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const reported_user_id = user.id;
        const reporter_id = req.user.id;
        console.log(reported_user_id, reporter_id)
        const existingReport = await Report.findOne({ where: { reported_user_id, reporter_id } });
        if (existingReport) {
            return res.status(400).json({ error: "You have already reported this user" });
        }

        const count = await Report.count({ where: { reported_user_id } });
        const status = count < 3 ? 'pending' : 'blocked';

        if (status === 'blocked') {
            user.is_blocked = true;
            const blockUntil = new Date();
            blockUntil.setDate(blockUntil.getDate() + 5);
            user.blocked_until = blockUntil;
            await user.save();
        }

        const report = await Report.create({ reporter_id, reported_user_id: reported_user_id, reason, status });
        res.status(201).json({ message: "Report submitted successfully", report });
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
};


exports.reviewUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { review } = req.body;

        const user = await User.findOne({ where: { id } }); //   fixed
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const report = await Report.findOne({ where: { reported_user_id: id } }); //   fixed
        if (!report) {
            return res.status(404).json({ error: 'Report not found' });
        }

        report.status = review;
        await report.save();

        user.is_blocked = false;
        await user.save();

        res.status(200).json({ message: "Report reviewed successfully", report });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
