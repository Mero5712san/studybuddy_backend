const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/auth.middleware');
const userController = require('../controllers/user.controller');

router.get('/', authMiddleware, userController.getAllUsers);
router.get('/me', authMiddleware, userController.getCurrentUser);
router.get('/:id', authMiddleware, userController.getUserById);
router.put('/:id', authMiddleware, userController.updateUser);
router.put('/:id/rate', authMiddleware, userController.rateUser);
router.put('/:id/report', authMiddleware, userController.reportUser);
router.put('/:id/review', authMiddleware, userController.reviewUser);

module.exports = router;