// 2. controllers/note.controller.js
const { Note, NoteRating, Report, Notification } = require('../models');
const { fn, col } = require('sequelize');
exports.uploadNote = async (req, res) => {
    try {
        const { title, description, type, subject, semester } = req.body;

        const note = await Note.create({
            title,
            description,
            file_url: req.file?.path || "http://example.com",
            type,
            subject,
            semester,
            uploader_id: req.user.id
        });

        const user_id = req.user.id;
        const content = `A new note has been uploaded by ${req.user.name}`;

        await Notification.create({ user_id, content });

        res.status(201).json({ message: "Note uploaded successfully", note });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


exports.getAllNotes = async (req, res) => {
    try {
        const notes = await Note.findAll({ where: { is_blocked: false } });
        res.status(200).json(notes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getNoteById = async (req, res) => {
    try {
        const { id } = req.params;

        const note = await Note.findOne({ where: { id, is_blocked: false } });

        if (!note) {
            return res.status(404).json({ error: "Note not found or has been blocked" });
        }

        return res.status(200).json(note);
    } catch (e) {
        return res.status(500).json({ error: e.message });
    }
};

exports.deleteNote = async (req, res) => {
    try {
        const { id } = req.params;

        const note = await Note.findByPk(id);

        if (!note) {
            return res.status(404).json({ error: "Note not found or already deleted" });
        }

        note.is_blocked = true;
        await note.save();

        res.status(200).json({ message: "Note deleted (soft delete) successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


exports.rateNote = async (req, res) => {
    try {
        const { id } = req.params;
        const { rating } = req.body;

        const note = await Note.findByPk(id);
        if (!note || note.is_blocked) {
            return res.status(404).json({ error: "Note not found" });
        }

        const note_id = note.id;
        const user_id = req.user.id;

        const existingRating = await NoteRating.findOne({ where: { note_id, user_id } });
        if (existingRating) {
            return res.status(400).json({ error: "You have already rated this note" });
        }

        const newRating = await NoteRating.create({ note_id, user_id, rating });

        const result = await NoteRating.findOne({
            attributes: [[fn('AVG', col('rating')), 'avgRating']],
            where: { note_id },
            raw: true
        });
        const average = parseFloat(result.avgRating) || 0;

        note.rating = average;
        await note.save();

        res.status(201).json({ message: "Rating added successfully", rating: newRating });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};


exports.reportNote = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        const note = await Note.findByPk(id);
        if (!note || note.is_blocked) {
            return res.status(404).json({ error: "Note not found" });
        }

        const note_id = note.id;
        const user_id = req.user.id;

        const alreadyReported = await Report.findOne({
            where: { reporter_id: user_id, reported_note_id: note_id }
        });

        if (alreadyReported) {
            return res.status(400).json({ error: "You have already reported this note" });
        }

        const count = await Report.count({ where: { reported_note_id: note_id } }); // ✅ Fixed here

        const status = count < 3 ? 'pending' : 'blocked';

        if (status === 'blocked') {
            note.is_blocked = true;
            note.blocked_reason = "Reported by large number of users";
            await note.save();
        }

        const report = await Report.create({
            reporter_id: user_id,
            reported_note_id: note_id,
            reason,
            status
        });

        res.status(201).json({ message: "Report submitted successfully", report });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};
