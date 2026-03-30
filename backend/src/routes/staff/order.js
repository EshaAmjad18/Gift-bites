///src//routes/staff/order.js
const express = require('express');
const router = express.Router();

// ✅ DESTRUCTURED IMPORT - ADD markCashReceived
const {
  getOrders,
  updateOrderStatus,
  getOrderStats,
  sendWarning,
  getTodaysOrders,
} = require('../../controllers/staff/order');

// ✅ PROTECT STAFF MIDDLEWARE
const { protectStaff } = require('../../middleware/authMiddleware');

// ✅ MODELS
const Order = require('../../models/Order');
const Staff = require('../../models/Staff');

// ==================== EXISTING ROUTES ====================
router.get('/', protectStaff, getOrders);
router.get('/today', protectStaff, getTodaysOrders);
router.get('/stats', protectStaff, getOrderStats);
router.put('/:id/status', protectStaff, updateOrderStatus);
router.post('/:id/warning', protectStaff, sendWarning);


router.put('/:id/cash-payment', protectStaff, async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('🔵 Cash payment request for order:', id);
    console.log('Staff ID:', req.staff?._id);
    console.log('Staff info:', req.staff);
    
    // Find order
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // ✅ Check staff access
    if (!req.staff || !req.staff.cafeteria) {
      return res.status(403).json({
        success: false,
        message: 'Staff information incomplete'
      });
    }

    if (order.cafeteria !== req.staff.cafeteria) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access - Order does not belong to your cafeteria'
      });
    }

    // ✅ Check payment status
    if (order.paymentStatus !== '50_paid') {
      return res.status(400).json({
        success: false,
        message: 'Order does not have pending cash payment'
      });
    }

    if (order.status !== 'picked') {
      return res.status(400).json({
        success: false,
        message: 'Order must be marked as picked first'
      });
    }

    // ✅ Update payment status
    order.paymentStatus = 'cash_50_received'; // ✅ Use this instead of '100_paid'
    order.remainingPayment = 0;
    await order.save();

    console.log('✅ Cash payment marked for order:', order.orderNumber);

    res.json({
      success: true,
      message: 'Cash payment marked as received',
      order: {
        paymentStatus: order.paymentStatus,
        advancePayment: order.advancePayment,
        remainingPayment: order.remainingPayment,
        totalAmount: order.totalAmount
      }
    });

  } catch (error) {
    console.error('Cash payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark cash payment',
      error: error.message
    });
  }
});

// ✅ TEST ROUTE
router.get('/test-auth', protectStaff, (req, res) => {
  console.log('✅ Staff auth test successful:', req.staff);
  res.json({
    success: true,
    message: 'Staff authenticated successfully',
    staff: {
      id: req.staff._id,
      email: req.staff.email,
      cafeteria: req.staff.cafeteria,
      role: req.staff.role
    }
  });
});


// backend/src/routes/staff/order.js
router.get('/test-users', async (req, res) => {
  try {
    const orders = await Order.find().populate('user').limit(5);
    
    const userData = orders.map(order => ({
      orderNumber: order.orderNumber,
      userId: order.user?._id,
      userName: order.user?.name,
      userExists: !!order.user
    }));
    
    res.json({ success: true, userData });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}); 

// Add this route for manual overdue check
router.post('/check-overdue', async (req, res) => {
  try {
    const StrikeManager = require('../../utils/autoStrikeManager');
    const result = await StrikeManager.checkPickupDeadlines();
    
    res.json(result);
  } catch (error) {
    console.error('Error in check-overdue:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}); 


module.exports = router;