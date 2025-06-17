const express = require('express');
const router = express.Router();
const MessageController = require('../controllers/message.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.get('/', authMiddleware, MessageController.getMessages);
router.post('/', authMiddleware, MessageController.sendMessage);

module.exports = router;