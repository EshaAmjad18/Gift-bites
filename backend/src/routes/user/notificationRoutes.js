// backend/routes/user/notificationRoutes.js
const express = require('express');
const {
  getNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteUserNotification,
  clearReadNotifications
} = require('../../controllers/user/notificationController');


const { authMiddleware } = require('../../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);
// Get all notifications
router.get('/', getNotifications);

// Get unread count
router.get('/unread-count', getUnreadCount);

// Mark notification as read
router.put('/:id/read', markNotificationAsRead);

// Mark all as read
router.put('/mark-all-read', markAllNotificationsAsRead);

// Delete notification
router.delete('/:id', deleteUserNotification);

// Clear all read notifications
router.delete('/clear-read', clearReadNotifications);

module.exports = router;