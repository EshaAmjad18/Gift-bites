// backend/src/models/Notification.js
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  // Recipient
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Notification Content
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  
  // Notification Type (FRS Requirement)
  type: {
    type: String,
    enum: [
      'order',        // Order status changes
      'payment',      // Payment success/failure
      'warning',      // Warnings about blocking
      'fine',         // Fine applied
      'refund',       // Refund processed
      'cancellation', // Order cancelled
      'system',       // System notifications
      'promotion'     // Promotional
    ],
    default: 'system'
  },
  
  // Status
  read: {
    type: Boolean,
    default: false
  },
  
  // Priority (FRS: Important notifications highlight)
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  
  // Related Data
  relatedOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  relatedPayment: String, // Stripe payment ID
  relatedFine: Number,
  
  // Expiry (optional)
  expiresAt: Date,
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  readAt: Date
}, {
  timestamps: true
});

// Auto-expire old notifications (optional)
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Mark as read
notificationSchema.methods.markAsRead = function() {
  this.read = true;
  this.readAt = new Date();
  return this.save();
};

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;