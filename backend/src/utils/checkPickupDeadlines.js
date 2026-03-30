const Order = require('../models/Order');
const User = require('../models/User');
const Notification = require('../models/Notification');

const checkPickupDeadlines = async () => {
  try {
    console.log('🔍 Checking pickup deadlines...');
    
    // Find orders that are ready and not picked up
    const orders = await Order.find({ 
      status: 'ready', 
      fineApplied: false,
      pickedAt: { $exists: false }
    }).populate('user');

    console.log(`Found ${orders.length} orders to check`);

    const now = new Date();
    for (let order of orders) {
      console.log(`Checking order ${order.orderNumber}:`, {
        pickupDeadline: order.pickupDeadline,
        now: now,
        isLate: order.pickupDeadline && now > order.pickupDeadline
      });

      // Check if pickup deadline has passed
      if (order.pickupDeadline && now > order.pickupDeadline) {
        console.log(`Order ${order.orderNumber} is late! Applying fine...`);

        try {
          // Apply fine using model method
          const fineAmount = order.applyFine();
          
          if (fineAmount > 0) {
            // ✅ AB ORDER MODEL KI FIELDS USE KARO (User ki nahi)
            order.pendingFines = (order.pendingFines || 0) + fineAmount;
            order.totalFines = (order.totalFines || 0) + fineAmount;
            order.strikes = (order.strikes || 0) + 1;
            order.lastStrikeAt = new Date();
            
            // Strike reasons maintain karo
            if (!order.strikeReasons) order.strikeReasons = [];
            order.strikeReasons.push('Late pickup - not picked within 2 hours');
            
            await order.save();
            console.log(`✅ Order ${order.orderNumber} updated. Fine: Rs. ${fineAmount}`);

            // User ko bhi update karo (if needed)
            if (order.user && order.user._id) {
              const user = await User.findById(order.user._id);
              if (user) {
                // User ke liye bhi fines and strikes update karo
                user.pendingFines = (user.pendingFines || 0) + fineAmount;
                user.totalFines = (user.totalFines || 0) + fineAmount;
                user.strikes = (user.strikes || 0) + 1;
                user.lastStrikeAt = new Date();
                
                // Strike reasons for user
                if (!user.strikeReasons) user.strikeReasons = [];
                user.strikeReasons.push(`Order ${order.orderNumber}: Late pickup`);
                
                // Block user if 3 strikes
                if (user.strikes >= 3 && !user.isBlocked) {
                  user.isBlocked = true;
                  user.blockReason = 'Account blocked due to 3 strikes';
                  user.blockedAt = new Date();
                }
                
                await user.save();
                console.log(`✅ User ${user._id} updated. Strikes: ${user.strikes}/3`);
              }
            }

            // Send notification to user
            if (order.user && order.user._id) {
              await Notification.create({
                user: order.user._id,
                type: 'fine_applied',
                title: 'Late Pickup Fine Applied',
                message: `Your order #${order.orderNumber} was not picked up on time. A fine of Rs. ${fineAmount} has been applied. Strike ${order.strikes}/3.`,
                priority: 'high',
                relatedOrder: order._id
              });
              console.log(`📧 Notification sent for order ${order.orderNumber}`);
            }

            // If order has 3 strikes, block it
            if (order.strikes >= 3 && !order.isBlocked) {
              order.isBlocked = true;
              order.blockReason = 'Order blocked due to 3 strikes';
              order.blockedAt = new Date();
              await order.save();
              console.log(`🚫 Order ${order.orderNumber} blocked due to 3 strikes`);
            }
          } else {
            console.log(`No fine applied to order ${order.orderNumber}`);
          }

        } catch (error) {
          console.error(`Error processing order ${order.orderNumber}:`, error);
        }
      } else {
        console.log(`Order ${order.orderNumber} is on time`);
      }
    }

    console.log('✅ Pickup deadline check completed');
  } catch (error) {
    console.error('❌ Error in pickup deadline check:', error);
  }
};

module.exports = { checkPickupDeadlines };