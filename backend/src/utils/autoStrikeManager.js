// backend/src/utils/autoStrikeManager.js - SIMPLE VERSION
const Order = require('../models/Order');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { createNotification } = require('./notificationHelper');

class StrikeManager {
  // Manual check (call this from API endpoint)
  static checkPickupDeadlines = async () => {
    try {
      console.log('⏰ Checking pickup deadlines...');
      
      const now = new Date();
      const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60000);
      
      // Find orders marked ready more than 2 hours ago but not picked
      const overdueOrders = await Order.find({
        status: 'ready',
        readyAt: { $lt: twoHoursAgo },
        fineApplied: false  // Not yet fined
      }).populate('user');
      
      console.log(`Found ${overdueOrders.length} overdue orders`);
      
      let processed = 0;
      for (const order of overdueOrders) {
        const result = await this.handleOverdueOrder(order);
        if (result) processed++;
      }
      
      return {
        success: true,
        message: `Processed ${processed} overdue orders`,
        totalFound: overdueOrders.length,
        processed: processed
      };
    } catch (error) {
      console.error('Error checking pickup deadlines:', error);
      return {
        success: false,
        message: error.message
      };
    }
  };

  static handleOverdueOrder = async (order) => {
    try {
      console.log(`🚨 Processing overdue order: ${order.orderNumber}`);
      
      // 1. Apply fine (10% of total amount)
      const fineAmount = Math.round(order.totalAmount * 0.1);
      order.fineApplied = true;
      order.fineAmount = fineAmount;
      order.status = 'not_picked';
      order.fineReason = 'Not picked up within 2 hours';
      
      // 2. Add strike to user
      if (order.user) {
        const user = order.user;
        const currentStrikes = user.strikes || 0;
        
        // Add strike to user
        user.strikes = currentStrikes + 1;
        user.lastStrikeAt = new Date();
        
        // Add strike to order as well
        order.strikes = (order.strikes || 0) + 1;
        order.lastStrikeAt = new Date();
        
        // Check if user should be blocked (3 strikes)
        if (user.strikes >= 3) {
          user.isBlocked = true;
          user.blockedAt = new Date();
          user.blockReason = '3 strikes for not picking up orders';
          console.log(`🚨 User ${user.email} blocked due to 3 strikes`);
        }
        
        await user.save();
        
        // 3. Create notification for user
        await createNotification(
          user._id,
          '⚠️ Late Pickup - Fine & Strike Applied',
          `Your order #${order.orderNumber} was not picked up within 2 hours.\n` +
          `• Fine Applied: Rs. ${fineAmount} (10% of order total)\n` +
          `• Strike Added: You now have ${user.strikes}/3 strikes\n` +
          (user.strikes >= 3 ? '🚨 Your account has been blocked!\n' : ''),
          'warning',
          { orderId: order._id }
        );
      }
      
      await order.save();
      console.log(`✅ Order ${order.orderNumber} processed: Fine=${fineAmount}, Strikes=${order.strikes}`);
      
      return true;
    } catch (error) {
      console.error(`Error processing overdue order ${order._id}:`, error);
      return false;
    }
  };

  // Simple initialization
  static init = () => {
    console.log('✅ Strike Manager initialized (manual mode)');
    console.log('📝 Call /api/staff/check-overdue to process overdue orders');
  };
}

module.exports = StrikeManager;