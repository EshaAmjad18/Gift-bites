
// backend/src/routes/user/paymentRoutes.js
const express = require('express');
const router = express.Router();
const orderController = require('../../controllers/user/orderController');
const { authMiddleware } = require('../../middleware/authMiddleware'); 
router.use(authMiddleware); 

router.post('/create-session', orderController.createPaymentSession); // Create Stripe session
router.get('/verify/:sessionId', orderController.verifyPayment); // Verify payment
router.get('/status/:orderId', orderController.getOrderPaymentStatus); // Get payment status

// Test endpoint
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Payment API is working',
    user: req.userId ? req.userId : 'Not authenticated'
  });
});

// Debug endpoint
router.get('/debug/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    console.log('=== DEBUG SESSION ===');
    console.log('Session ID:', sessionId);
    
    // Get session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    // Find in database
    const order = await Order.findOne({ stripeSessionId: sessionId });
    
    res.json({
      success: true,
      stripe: {
        id: session.id,
        payment_status: session.payment_status,
        amount_total: session.amount_total,
        metadata: session.metadata,
        customer_email: session.customer_email,
        created: session.created
      },
      database: order ? {
        id: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
        stripeSessionId: order.stripeSessionId,
        stripePaymentId: order.stripePaymentId
      } : 'NOT FOUND'
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});


module.exports = router;