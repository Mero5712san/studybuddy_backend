const express = require('express');
const router = express.Router();
const NoteController = require('../controllers/note.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');

router.post('/', authMiddleware, upload.single('file'), NoteController.uploadNote);
router.get('/', NoteController.getAllNotes);
router.get('/:id', NoteController.getNoteById);
router.delete('/:id', authMiddleware, NoteController.deleteNote);
router.post('/:id/rate', authMiddleware, NoteController.rateNote);
router.post('/:id/report', authMiddleware, NoteController.reportNote);

module.exports = router;