const express = require('express');
const router = express.Router();
const NotificationController = require('../controllers/notifications.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.get('/', authMiddleware, NotificationController.getNotifications);
router.post('/', authMiddleware, NotificationController.pushNotification);
router.put('/:id/read', authMiddleware, NotificationController.readNotification);

module.exports = router;