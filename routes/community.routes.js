const express = require('express');
const router = express.Router();
const CommunityController = require('../controllers/community.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.post('/question', authMiddleware, CommunityController.postQuestion);
router.get('/questions', CommunityController.getQuestions);
router.post('/question/:id/answer', authMiddleware, CommunityController.answerQuestion);
router.post('/answer/:id/rate', authMiddleware, CommunityController.rateAnswer);
router.post('/question/:id/rate', authMiddleware, CommunityController.rateQuestion);
router.get('/answers/:id', CommunityController.getAnswers);

module.exports = router;