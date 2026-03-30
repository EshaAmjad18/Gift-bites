// backend/src/controllers/staff/refund.js
const Order = require('../../models/Order');
const Refund = require('../../models/Refund');
const Staff = require('../../models/Staff');
const Notification = require('../../models/Notification');

// Get pending cash refunds
exports.getPendingCashRefunds = async (req, res) => {
  try {
    console.log('🔍 Fetching pending cash refunds for staff:', req.user._id);
    
    // Get staff details
    const staff = await Staff.findById(req.user._id);
    if (!staff) {
      return res.status(404).json({ 
        success: false, 
        message: 'Staff not found' 
      });
    }

    console.log('📌 Staff cafeteria:', staff.cafeteria);

    // Find cancelled/rejected orders from this cafeteria
    const orders = await Order.find({
      cafeteria: staff.cafeteria,
      status: { $in: ['cancelled', 'rejected'] },
      refundStatus: { $ne: 'completed' }
    })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    console.log(`📊 Found ${orders.length} pending refunds`);

    // Format response with paid amount
    const formattedOrders = orders.map(order => {
      // Calculate paid amount
      let paidAmount = 0;
      
      if (order.paymentOption === '50') {
        paidAmount = order.totalAmount * 0.5; // 50% advance
      } else if (order.paymentOption === '100') {
        paidAmount = order.totalAmount; // 100% paid
      }

      // If cash was received at pickup
      if (order.paymentStatus === 'cash_50_received') {
        paidAmount = order.totalAmount; // Full amount
      }

      return {
        _id: order._id,
        orderNumber: order.orderNumber,
        user: order.user,
        status: order.status,
        items: order.items || [],
        totalAmount: order.totalAmount,
        paidAmount: paidAmount,
        paymentOption: order.paymentOption,
        paymentStatus: order.paymentStatus,
        refundStatus: order.refundStatus || 'none',
        createdAt: order.createdAt,
        // Make sure items exist
        items: order.items || []
      };
    });

    res.json({
      success: true,
      data: formattedOrders
    });
  } catch (error) {
    console.error('❌ Error fetching pending refunds:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message 
    });
  }
};

// Mark cash refund as completed
exports.markCashRefundComplete = async (req, res) => {
  try {
    const { orderId } = req.params;
    const staffId = req.user._id;

    console.log(`💰 Processing cash refund for order: ${orderId} by staff: ${staffId}`);

    // Get staff
    const staff = await Staff.findById(staffId);
    if (!staff) {
      return res.status(404).json({ 
        success: false, 
        message: 'Staff not found' 
      });
    }

    // Find the order
    const order = await Order.findById(orderId)
      .populate('user', 'name email');

    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }

    // Check if order belongs to staff's cafeteria
    if (order.cafeteria !== staff.cafeteria) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to process this order' 
      });
    }

    // Check if order is cancelled/rejected
    if (!['cancelled', 'rejected'].includes(order.status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Order is not cancelled or rejected' 
      });
    }

    // Check if already refunded
    if (order.refundStatus === 'completed') {
      return res.status(400).json({ 
        success: false, 
        message: 'Refund already completed' 
      });
    }

    // Calculate refund amount
    let refundAmount = 0;
    if (order.paymentOption === '50') {
      refundAmount = order.totalAmount * 0.5; // 50% advance
    } else if (order.paymentOption === '100') {
      refundAmount = order.totalAmount; // 100% paid
    }

    // If cash was received at pickup
    if (order.paymentStatus === 'cash_50_received') {
      refundAmount = order.totalAmount; // Full amount
    }

    console.log(`💸 Refund amount calculated: PKR ${refundAmount}`);

    // Update order
    order.refundStatus = 'completed';
    order.refundMethod = 'cash';
    order.refundAmount = refundAmount;
    order.refundProcessedBy = staffId;
    order.refundProcessedAt = new Date();
    await order.save();

    // Create refund record
    const refund = new Refund({
      order: order._id,
      user: order.user._id,
      amount: refundAmount,
      method: 'cash',
      status: 'completed',
      processedBy: staffId,
      notes: 'Cash refund issued at cafeteria counter'
    });
    await refund.save();

    // Create notification for user
    const notification = new Notification({
      user: order.user._id,
      type: 'refund',
      title: 'Cash Refund Completed',
      message: `Your cash refund of PKR ${refundAmount} for order #${order.orderNumber} has been processed.`,
      relatedId: order._id
    });
    await notification.save();

    console.log('✅ Cash refund completed successfully');

    res.json({
      success: true,
      message: 'Cash refund marked as completed',
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        refundAmount: refundAmount,
        processedAt: new Date()
      }
    });
  } catch (error) {
    console.error('❌ Error marking cash refund:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message 
    });
  }
};

// Get refund statistics
exports.getRefundStats = async (req, res) => {
  try {
    const staff = await Staff.findById(req.user._id);
    
    // Count pending refunds
    const pendingCount = await Order.countDocuments({
      cafeteria: staff.cafeteria,
      status: { $in: ['cancelled', 'rejected'] },
      refundStatus: { $ne: 'completed' }
    });

    // Get completed refunds total
    const completedRefunds = await Refund.aggregate([
      {
        $lookup: {
          from: 'orders',
          localField: 'order',
          foreignField: '_id',
          as: 'orderData'
        }
      },
      { $unwind: '$orderData' },
      {
        $match: {
          'orderData.cafeteria': staff.cafeteria,
          status: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    const stats = {
      pendingCount,
      completedStats: completedRefunds[0] || { totalAmount: 0, count: 0 }
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('❌ Error getting refund stats:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message 
    });
  }
};