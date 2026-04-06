const router = require('express').Router();
const Controller = require('../controllers/notification.Controller');

// Get all notifications for a user
router.get('/', Controller.getAll);

// Get unread count
router.get('/unread-count', Controller.getUnreadCount);

// Mark single notification as read
router.put('/:id/read', Controller.markAsRead);

// Mark all notifications as read
router.put('/read-all', Controller.markAllAsRead);

// Delete notification
router.delete('/:id', Controller.delete);

module.exports = router;