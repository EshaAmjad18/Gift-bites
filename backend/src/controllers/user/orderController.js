// backend/src/controllers/user/orderController.js
// backend/src/controllers/user/orderController.js

const Order = require('../../models/Order');
const Cart = require('../../models/Cart');
const User = require('../../models/User');
const MenuItem = require('../../models/MenuItem');
const Notification = require('../../models/Notification');
const stripe = require('../../config/stripe');

// ✅ Create order from cart
exports.createOrder = async (req, res) => {
  try {
    const userId = req.userId;
    const { paymentOption, notes } = req.body; // paymentOption: '50' or '100'

    console.log('=== CREATING ORDER WITH STRIPE ===');
    console.log('User:', userId, 'Payment option:', paymentOption);

    // 1. Validate payment option
    if (!['50', '100'].includes(paymentOption)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment option. Choose either 50 or 100.'
      });
    }

    // 2. Get user's cart
    const cart = await Cart.findOne({ user: userId }).populate('items.menuItem');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }

    // 3. Calculate total
    let totalAmount = 0;
    const orderItems = [];

    for (const cartItem of cart.items) {
      const menuItem = await MenuItem.findById(cartItem.menuItem);
      if (!menuItem || !menuItem.availableToday) {
        return res.status(400).json({
          success: false,
          message: `Item ${cartItem.itemName} is not available today`
        });
      }

      totalAmount += cartItem.price * cartItem.quantity;

      orderItems.push({
        menuItem: menuItem._id,
        name: menuItem.name,
        quantity: cartItem.quantity,
        price: menuItem.price,
        image: menuItem.image
      });
    }

    // 4. Calculate advance payment (FRS: 50% or 100%)
    const advancePayment = paymentOption === '50' 
      ? Math.round(totalAmount * 0.5)
      : totalAmount;

    const remainingPayment = paymentOption === '50'
      ? totalAmount - advancePayment
      : 0;

    // 5. Generate order number
    const generateOrderNumber = () => {
      const date = new Date();
      const year = date.getFullYear().toString().slice(-2);
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const random = Math.floor(1000 + Math.random() * 9000);
      return `ORD-${year}${month}${day}-${random}`;
    };

    // 6. Create order
    const order = new Order({
      user: userId,
      cafeteria: cart.cafeteria,
      items: orderItems,
      totalAmount,
      advancePayment,
      remainingPayment,
      paymentOption,
      notes,
      orderNumber: generateOrderNumber(),
      status: 'pending_payment',
      paymentStatus: 'pending'
    });

    await order.save();

    console.log('✅ Order created:', order.orderNumber, 'Total:', totalAmount);

    res.status(201).json({
      success: true,
      message: 'Order created successfully. Ready for payment.',
      order: {
        _id: order._id,
        orderNumber: order.orderNumber,
        totalAmount,
        advancePayment,
        remainingPayment,
        paymentOption,
        items: orderItems,
        status: order.status,
        paymentStatus: order.paymentStatus,
        createdAt: order.createdAt,
        canCancelUntil: order.canCancelUntil
      }
    });

  } catch (error) {
    console.error('❌ Create order error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create order'
    });
  }
};

// ✅ Create Stripe Checkout Session (FIXED WITH MINIMUM AMOUNT ENFORCEMENT)
// backend/src/controllers/user/orderController.js
exports.createPaymentSession = async (req, res) => {
  try {
    const { orderId } = req.body;
    const userId = req.userId;
    
    console.log('Creating payment session for order:', orderId);
    
    // Find order
    const order = await Order.findOne({ 
      _id: orderId, 
      user: userId,
      status: 'pending_payment'
    });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or not pending payment'
      });
    }
    
    // ✅ Redirect to payment controller
    const paymentController = require('./paymentController');
    return paymentController.createCheckoutSession(req, res);
    
  } catch (error) {
    console.error('Error creating payment session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment session'
    });
  }
};
// ✅ FIXED Verify Payment
exports.verifyPayment = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.userId;

    console.log('=== VERIFYING PAYMENT ===');
    console.log('Session ID:', sessionId);
    console.log('User ID:', userId);

    // 1. Retrieve session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    console.log('✅ Stripe session retrieved');
    console.log('Payment status:', session.payment_status);
    console.log('Metadata:', session.metadata);

    // 2. Find order by session ID OR metadata
    let order = await Order.findOne({ 
      stripeSessionId: sessionId,
      user: userId 
    });

    // If not found by sessionId, try by metadata orderId
    if (!order && session.metadata && session.metadata.orderId) {
      order = await Order.findOne({
        _id: session.metadata.orderId,
        user: userId
      });
    }

    if (!order) {
      console.error('❌ Order not found for session:', sessionId);
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    console.log('✅ Order found:', order.orderNumber);

    // 3. Check payment status
    if (session.payment_status === 'paid') {
      // Payment successful
      console.log('✅ Payment successful for order:', order.orderNumber);
      
      res.json({
        success: true,
        paid: true,
        orderId: order._id,
        orderNumber: order.orderNumber,
        amount: session.amount_total / 100,
        paymentStatus: 'paid',
        orderStatus: order.status,
        redirectTo: '/user/orders'
      });
    } else if (session.payment_status === 'unpaid') {
      // Payment not completed
      console.log('❌ Payment not completed');
      
      res.json({
        success: true,
        paid: false,
        message: 'Payment not completed',
        paymentStatus: session.payment_status,
        redirectTo: '/user/payment/cancel'
      });
    } else {
      // Other status
      res.json({
        success: true,
        paid: false,
        message: `Payment status: ${session.payment_status}`,
        paymentStatus: session.payment_status,
        redirectTo: '/user/orders'
      });
    }

  } catch (error) {
    console.error('❌ Verify payment error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to verify payment',
      error: error.message,
      stripeError: error.type
    });
  }
};

// ✅ Handle Stripe Webhook
exports.stripeWebhook = async (req, res) => {
  console.log('=== STRIPE WEBHOOK RECEIVED ===');
  
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  let event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      endpointSecret
    );
    console.log('✅ Webhook verified. Event type:', event.type);
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleSuccessfulPayment(event.data.object);
        break;
        
      case 'checkout.session.expired':
        await handleExpiredPayment(event.data.object);
        break;
        
      case 'charge.refunded':
        await handleRefund(event.data.object);
        break;
        
      case 'checkout.session.async_payment_failed':
        console.log('❌ Payment failed for session:', event.data.object.id);
        break;
        
      default:
        console.log(`🔔 Unhandled event type: ${event.type}`);
    }
    
    res.json({ received: true });
  } catch (error) {
    console.error('❌ Webhook handler error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
};

// Helper: Handle successful payment
async function handleSuccessfulPayment(session) {
  try {
    const orderId = session.metadata.orderId;
    const userId = session.metadata.userId;
    const paymentOption = session.metadata.paymentOption;
    const orderNumber = session.metadata.orderNumber;

    console.log('=== PAYMENT SUCCESSFUL WEBHOOK ===');
    console.log('Order ID:', orderId);
    console.log('Order Number:', orderNumber);
    console.log('Session ID:', session.id);
    console.log('Payment ID:', session.payment_intent);
    console.log('Amount:', session.amount_total / 100);

    // 1. Find and update order
    const order = await Order.findOne({
      _id: orderId,
      user: userId
    });

    if (!order) {
      console.error('Order not found:', orderId);
      return;
    }

    // 2. Update payment information
    order.stripePaymentId = session.payment_intent;
    order.stripeSessionId = session.id;
    order.paymentStatus = paymentOption === '100' ? 'paid' : 'partially_paid';
    order.advancePayment = session.amount_total / 100;
    order.remainingPayment = paymentOption === '50' 
      ? order.totalAmount - (session.amount_total / 100)
      : 0;

    // 3. Update order status (FRS Requirement: Auto-confirm with "Pending Staff Acceptance")
    order.status = 'pending_staff';

    await order.save();

    // 4. Clear user's cart
    await Cart.findOneAndDelete({ user: userId });

    // 5. Create success notification
    const notification = new Notification({
      user: userId,
      title: 'Payment Successful',
      message: `Payment of Rs. ${session.amount_total / 100} for order #${orderNumber} has been confirmed.`,
      type: 'payment',
      priority: 'high',
      relatedOrder: order._id
    });
    await notification.save();

    console.log('✅ Order updated after successful payment:', orderNumber);

  } catch (error) {
    console.error('❌ Error handling successful payment:', error);
  }
}

// Helper: Handle expired payment
async function handleExpiredPayment(session) {
  try {
    const orderId = session.metadata.orderId;
    
    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        status: 'cancelled',
        cancelledBy: 'system',
        cancellationReason: 'Payment session expired'
      },
      { new: true }
    );

    console.log('❌ Payment expired for order:', order?.orderNumber);
  } catch (error) {
    console.error('❌ Error handling expired payment:', error);
  }
}

// Helper: Handle refund
async function handleRefund(charge) {
  try {
    const order = await Order.findOne({ 
      stripePaymentId: charge.payment_intent 
    });

    if (order) {
      order.paymentStatus = 'refunded';
      order.refundStatus = 'completed';
      order.refundAmount = charge.amount_refunded / 100;
      order.refundedAt = new Date();
      await order.save();

      const notification = new Notification({
        user: order.user,
        title: 'Refund Processed',
        message: `Refund of Rs. ${charge.amount_refunded / 100} for order #${order.orderNumber} has been processed.`,
        type: 'refund',
        priority: 'medium',
        relatedOrder: order._id
      });
      await notification.save();

      console.log('✅ Refund processed for order:', order.orderNumber);
    }
  } catch (error) {
    console.error('❌ Error handling refund:', error);
  }
}

// ✅ Get order payment status
exports.getOrderPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.userId;

    const order = await Order.findOne({
      _id: orderId,
      user: userId
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      order: {
        _id: order._id,
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
        advancePayment: order.advancePayment,
        remainingPayment: order.remainingPayment,
        paymentOption: order.paymentOption,
        paymentStatus: order.paymentStatus,
        stripePaymentId: order.stripePaymentId,
        stripeSessionId: order.stripeSessionId,
        status: order.status,
        canCancel: order.canCancel()
      }
    });

  } catch (error) {
    console.error('❌ Get payment status error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch payment status'
    });
  }
};

// ✅ Get active orders for user
exports.getActiveOrders = async (req, res) => {
  try {
    const userId = req.userId;

    const orders = await Order.find({
      user: userId,
      status: { 
        $in: [
          'pending_payment',
          'pending_staff', 
          'accepted', 
          'preparing', 
          'ready'
        ] 
      }
    })
    .sort({ createdAt: -1 })
    .populate('items.menuItem', 'name image')
    .lean();

    // Format response
    const formattedOrders = orders.map(order => ({
      _id: order._id,
      orderNumber: order.orderNumber,
      cafeteria: order.cafeteria,
      items: order.items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        image: item.image
      })),
      totalAmount: order.totalAmount,
      advancePayment: order.advancePayment,
      remainingPayment: order.remainingPayment,
      paymentOption: order.paymentOption,
      paymentStatus: order.paymentStatus,
      status: order.status,
      createdAt: order.createdAt,
      readyAt: order.readyAt,
      canCancel: order.canCancelUntil && new Date() <= order.canCancelUntil,
      canCancelUntil: order.canCancelUntil
    }));

    res.json({
      success: true,
      orders: formattedOrders,
      count: orders.length
    });

  } catch (error) {
    console.error('❌ Get active orders error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch orders'
    });
  }
};

// ✅ Get order history (completed/cancelled/rejected)
exports.getOrderHistory = async (req, res) => {
  try {
    const userId = req.userId;
    const { status, startDate, endDate, page = 1, limit = 20 } = req.query;

    const query = { 
      user: userId,
      status: { 
        $in: [
          'picked', 
          'not_picked', 
          'cancelled', 
          'rejected', 
          'completed'
        ] 
      }
    };

    // Filter by status if provided
    if (status && status !== 'all') {
      query.status = status;
    }

    // Filter by date range
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate + 'T23:59:59.999Z')
      };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('items.menuItem', 'name image')
        .lean(),
      Order.countDocuments(query)
    ]);

    // Calculate statistics
    const stats = {
      totalOrders: await Order.countDocuments({ user: userId }),
      completedOrders: await Order.countDocuments({ 
        user: userId, 
        status: { $in: ['picked', 'completed'] } 
      }),
      cancelledOrders: await Order.countDocuments({ 
        user: userId, 
        status: 'cancelled' 
      }),
      totalSpent: await Order.aggregate([
        { $match: { 
          user: userId, 
          status: { $in: ['picked', 'completed'] } 
        }},
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]).then(result => result[0]?.total || 0)
    };

    res.json({
      success: true,
      orders,
      stats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('❌ Get order history error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch order history'
    });
  }
};

// ✅ Get single order details
exports.getOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.userId;

    const order = await Order.findOne({
      _id: orderId,
      user: userId
    })
    .populate('items.menuItem', 'name image category')
    .populate('user', 'name email phone')
    .lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Calculate if order can be cancelled (10 min window - FRS)
    const canCancel = order.canCancelUntil && new Date() <= order.canCancelUntil;

    res.json({
      success: true,
      order: {
        ...order,
        canCancel,
        timeToCancel: canCancel 
          ? Math.max(0, Math.floor((order.canCancelUntil - new Date()) / 60000))
          : 0
      }
    });

  } catch (error) {
    console.error('❌ Get order details error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch order details'
    });
  }
};

// ✅ FIXED Cancel Order
exports.cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;
    const userId = req.userId;

    console.log('=== CANCELLING ORDER ===');
    console.log('Order ID:', orderId);
    console.log('User ID:', userId);
    console.log('Reason:', reason);

    // 1. Find order
    const order = await Order.findOne({
      _id: orderId,
      user: userId
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    console.log('Order found:', order.orderNumber);
    console.log('Current status:', order.status);
    console.log('Can cancel until:', order.canCancelUntil);

    // 2. Check if order can be cancelled (10 min window - FRS)
    const now = new Date();
    
    // Check canCancel method
    if (!order.canCancel()) {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled after 10 minutes. Can cancel until: ${order.canCancelUntil?.toLocaleTimeString() || 'N/A'}`,
        canCancelUntil: order.canCancelUntil,
        currentTime: now,
        timeLeft: order.canCancelUntil ? Math.floor((order.canCancelUntil - now) / 60000) : 0
      });
    }

    // 3. Check status
    if (order.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Order is already cancelled'
      });
    }

    if (!['pending_payment', 'pending_staff', 'accepted'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled at this stage. Current status: ${order.status}`
      });
    }

    // 4. Update order
    order.status = 'cancelled';
    order.cancelledAt = now;
    order.cancelledBy = 'user';
    order.cancellationReason = reason || 'Cancelled by user';
    
    // If payment was made, initiate refund
    if (order.paymentStatus === 'paid' || order.paymentStatus === 'partially_paid') {
      order.refundRequested = true;
      order.refundStatus = 'pending';
      order.refundAmount = order.advancePayment || 0;
    }
    
    await order.save();

    console.log('✅ Order cancelled:', order.orderNumber);

    // 5. Create notification
    const notification = new Notification({
      user: userId,
      title: 'Order Cancelled',
      message: `Your order #${order.orderNumber} has been cancelled.`,
      type: 'cancellation',
      priority: 'high',
      relatedOrder: order._id
    });
    await notification.save();

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      order: {
        _id: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        cancelledAt: order.cancelledAt,
        refundInitiated: order.refundRequested
      }
    });

  } catch (error) {
    console.error('❌ Cancel order error:', error);
    
    // Cast error handling
  if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID format'
      });
    }
    
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to cancel order'
    });
  }
};

// ✅ Get recent orders (for profile page)
exports.getRecentOrders = async (req, res) => {
  try {
    const userId = req.userId;

    const orders = await Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('orderNumber totalAmount status createdAt cafeteria')
      .lean();

    res.json({
      success: true,
      orders
    });

  } catch (error) {
    console.error('❌ Get recent orders error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch recent orders'
    });
  }
};

// ✅ Check order cancellation eligibility
exports.checkCancellationEligibility = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.userId;

    const order = await Order.findOne({
      _id: orderId,
      user: userId
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const canCancel = order.canCancel();
    const timeLeft = canCancel 
      ? Math.max(0, Math.floor((order.canCancelUntil - new Date()) / 60000))
      : 0;

    res.json({
      success: true,
      canCancel,
      timeLeft, // minutes
      orderStatus: order.status,
      canCancelUntil: order.canCancelUntil
    });

  } catch (error) {
    console.error('❌ Check cancellation eligibility error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to check eligibility'
    });
  }
};
// ✅ STRIPE WEBHOOK ENDPOINT (Separate from other functions - NO AUTHENTICATION)
exports.stripeWebhook = async (req, res) => {
  console.log('=== STRIPE WEBHOOK RECEIVED ===');
  
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  let event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      endpointSecret
    );
    console.log('✅ Webhook verified. Event type:', event.type);
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleSuccessfulPayment(event.data.object);
        break;
        
      case 'checkout.session.expired':
        await handleExpiredPayment(event.data.object);
        break;
        
      case 'charge.refunded':
        await handleRefund(event.data.object);
        break;
        
      case 'checkout.session.async_payment_failed':
        console.log('❌ Payment failed for session:', event.data.object.id);
        break;
        
      default:
        console.log(`🔔 Unhandled event type: ${event.type}`);
    }
    
    res.json({ received: true });
  } catch (error) {
    console.error('❌ Webhook handler error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
};



// backend/src/controllers/user/orderController.js me add karo:
exports.updateOrderPayment = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { sessionId } = req.body;
    const userId = req.userId;

    console.log('=== 🔄 UPDATE ORDER PAYMENT ===');
    console.log('Order ID:', orderId);
    console.log('Session ID:', sessionId);
    console.log('User ID:', userId);

    // Find order
    const order = await Order.findOne({ 
      _id: orderId, 
      user: userId 
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    console.log('Order found:', order.orderNumber);
    console.log('Current status:', order.status);
    console.log('Current payment status:', order.paymentStatus);
    console.log('Payment option:', order.paymentOption);

    // Update based on payment option
    if (order.paymentOption === '100') {
      order.paymentStatus = '100_paid';
      order.advancePayment = order.totalAmount;
      order.remainingPayment = 0;
      console.log('✅ Updated to 100% paid');
    } else if (order.paymentOption === '50') {
      order.paymentStatus = '50_paid';
      order.advancePayment = Math.round(order.totalAmount * 0.5);
      order.remainingPayment = order.totalAmount - order.advancePayment;
      console.log('✅ Updated to 50% paid');
    }

    order.status = 'pending_staff';
    order.stripeSessionId = sessionId;
    order.updatedAt = new Date();
    
    await order.save();

    console.log('🎉 Order updated successfully!');
    console.log('New status:', order.status);
    console.log('New payment status:', order.paymentStatus);

    res.json({
      success: true,
      message: 'Order payment updated successfully',
      order: {
        _id: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
        totalAmount: order.totalAmount,
        advancePayment: order.advancePayment,
        remainingPayment: order.remainingPayment,
        cafeteria: order.cafeteria
      }
    });

  } catch (error) {
    console.error('❌ Update order payment error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to update order payment',
      error: error.message
    });
  }
};