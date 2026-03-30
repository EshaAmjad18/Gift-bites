const Notification = require('../../models/Notification');
const notificationHelper = require('../../utils/notificationHelper');

const getNotifications = async (req, res) => {
  try {
    const { notifications, unreadCount } = await notificationHelper.getUserNotifications(req.user._id);
    
    res.status(200).json({
      success: true,
      count: notifications.length,
      unreadCount,
      notifications
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching notifications'
    });
  }
};

const getUnreadCount = async (req, res) => {
  try {
    const unreadCount = await Notification.countDocuments({ 
      user: req.user._id, 
      read: false 
    });

    res.status(200).json({
      success: true,
      unreadCount
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching unread count'
    });
  }
};

const markNotificationAsRead = async (req, res) => {
  try {
    const notification = await notificationHelper.markAsRead(req.params.id, req.user._id);
    
    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      notification
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(404).json({
      success: false,
      message: error.message || 'Notification not found'
    });
  }
};

const markAllNotificationsAsRead = async (req, res) => {
  try {
    const count = await notificationHelper.markAllAsRead(req.user._id);
    
    res.status(200).json({
      success: true,
      message: `Marked ${count} notifications as read`,
      count
    });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error marking all as read'
    });
  }
};

const deleteUserNotification = async (req, res) => {
  try {
    const deleted = await notificationHelper.deleteNotification(req.params.id, req.user._id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found or unauthorized'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting notification'
    });
  }
};

const clearReadNotifications = async (req, res) => {
  try {
    const result = await Notification.deleteMany({
      user: req.user._id,
      read: true
    });
    
    res.status(200).json({
      success: true,
      message: `Cleared ${result.deletedCount} read notifications`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Clear read notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error clearing read notifications'
    });
  }
};

module.exports = {
  getNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteUserNotification,
  clearReadNotifications
};