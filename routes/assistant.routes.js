const express = require('express');
const router = express.Router();
const assistantController = require('../controllers/assistant.controller');

router.post('/chat', assistantController.chat);

module.exports = router;
