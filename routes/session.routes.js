const express = require('express');
const router = express.Router();
const SessionController = require('../controllers/session.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.post('/', authMiddleware, SessionController.requestSession);
router.patch('/:id/update', authMiddleware, SessionController.updateSession);
router.get('/', authMiddleware, SessionController.getSessions);

module.exports = router;