const express = require('express');
const router = express.Router();
const feedback = require('../controllers/feedback.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.get('/', authMiddleware, feedback.getFeedbacks);
router.post('/', authMiddleware, feedback.sendFeedback);

module.exports = router;