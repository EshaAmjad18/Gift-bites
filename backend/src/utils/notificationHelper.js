const Notification = require('../models/Notification');

const createNotification = async (userId, title, message, type = 'system', data = {}) => {
  try {
    const notificationData = {
      user: userId,
      title,
      message,
      type,
      read: false
    };

    if (data.orderId) {
      notificationData.relatedOrder = data.orderId;
    }
    if (data.paymentId) {
      notificationData.relatedPayment = data.paymentId;
    }
    if (data.fineAmount) {
      notificationData.relatedFine = data.fineAmount;
    }

    if (type === 'fine' || type === 'warning') {
      notificationData.priority = 'critical';
    } else if (type === 'order' || type === 'refund') {
      notificationData.priority = 'high';
    } else {
      notificationData.priority = 'medium';
    }

    const notification = new Notification(notificationData);
    await notification.save();
    
    console.log(`📢 Notification created: ${title} (${type}) for user ${userId}`);
    return notification;
  } catch (error) {
    console.error('❌ Error creating notification:', error);
    return null;
  }
};

const getUserNotifications = async (userId) => {
  try {
    const notifications = await Notification.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate('relatedOrder', 'orderNumber status totalAmount')
      .lean();

    const unreadCount = await Notification.countDocuments({ 
      user: userId, 
      read: false 
    });

    return { notifications, unreadCount };
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return { notifications: [], unreadCount: 0 };
  }
};

const markAsRead = async (notificationId, userId) => {
  try {
    const notification = await Notification.findOne({
      _id: notificationId,
      user: userId
    });

    if (!notification) {
      throw new Error('Notification not found or unauthorized');
    }

    notification.read = true;
    notification.readAt = new Date();
    await notification.save();

    return notification;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

const markAllAsRead = async (userId) => {
  try {
    const result = await Notification.updateMany(
      { user: userId, read: false },
      { 
        $set: { 
          read: true,
          readAt: new Date() 
        } 
      }
    );

    return result.modifiedCount;
  } catch (error) {
    console.error('Error marking all as read:', error);
    throw error;
  }
};

const deleteNotification = async (notificationId, userId) => {
  try {
    const result = await Notification.deleteOne({
      _id: notificationId,
      user: userId
    });

    return result.deletedCount > 0;
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};

module.exports = {
  createNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification
};