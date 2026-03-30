// backend/src/routes/user/order.js
const express = require('express');
const router = express.Router();
const orderController = require('../../controllers/user/orderController');
const { authMiddleware } = require('../../middleware/authMiddleware'); // ✅ FIXED

// Apply authentication middleware
router.use(authMiddleware); // ✅ FIXED

// Order routes
router.post('/', orderController.createOrder);
router.get('/active', orderController.getActiveOrders);
router.get('/history', orderController.getOrderHistory);
router.get('/recent', orderController.getRecentOrders);
router.get('/:orderId', orderController.getOrderDetails);
router.put('/:orderId/cancel', orderController.cancelOrder);
router.get('/:orderId/can-cancel', orderController.checkCancellationEligibility);
router.put('/:orderId/update-payment', orderController.updateOrderPayment);

// Test route
router.get('/test/debug', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Order routes working!',
    userId: req.userId 
  });
});


// backend/src/routes/user/order.js me yeh route add karo:
router.put('/:orderId/update-payment', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { sessionId } = req.body;
    const userId = req.userId; // authMiddleware se aa raha hai

    console.log('Updating payment for order:', orderId);

    // Simple update - no Stripe verification
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Check if user owns this order
    if (order.user.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Simple update logic
    if (order.paymentOption === '100') {
      order.paymentStatus = '100_paid';
      order.advancePayment = order.totalAmount;
      order.remainingPayment = 0;
    } else if (order.paymentOption === '50') {
      order.paymentStatus = '50_paid';
      order.advancePayment = Math.round(order.totalAmount * 0.5);
      order.remainingPayment = order.totalAmount - order.advancePayment;
    }

    order.status = 'pending_staff';
    order.stripeSessionId = sessionId;
    order.updatedAt = new Date();
    
    await order.save();

    console.log('Order updated:', order.orderNumber);

    res.json({
      success: true,
      message: 'Order payment updated successfully',
      order: {
        _id: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
        totalAmount: order.totalAmount,
        cafeteria: order.cafeteria
      }
    });

  } catch (error) {
    console.error('Update payment error:', error);
    res.status(500).json({ success: false, message: 'Failed to update payment' });
  }
});

module.exports = router;