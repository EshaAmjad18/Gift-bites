const stripe = require("../../config/stripe");
const Order = require("../../models/Order");
const Cart = require("../../models/Cart");
const Notification = require("../../models/Notification");

// ✅ CREATE STRIPE CHECKOUT SESSION (SAME)
exports.createCheckoutSession = async (req, res) => {
  try {
    const { orderId } = req.body;
    const userId = req.userId;

    console.log("=== 🛒 CREATING STRIPE CHECKOUT ===");
    console.log("Order ID:", orderId);
    console.log("User ID:", userId);

    // 1. Find order
    const order = await Order.findOne({
      _id: orderId,
      user: userId,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // 2. Check order status
    if (order.status !== "pending_payment") {
      return res.status(400).json({
        success: false,
        message: `Order cannot proceed to payment. Current status: ${order.status}`,
      });
    }

    // 3. Calculate amount
    let amount = 0;
    let description = "";

    if (order.paymentOption === "100") {
      amount = order.totalAmount;
      description = `Full payment for Order #${order.orderNumber}`;
    } else if (order.paymentOption === "50") {
      amount = Math.round(order.totalAmount * 0.5);
      description = `50% advance payment for Order #${order.orderNumber}`;
    }

    // 4. Create Stripe session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "pkr",
            product_data: {
              name: `Order #${order.orderNumber}`,
              description: `${order.cafeteria} - ${description}`,
            },
            unit_amount: amount * 100,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL}/user/payment/success?session_id={CHECKOUT_SESSION_ID}&order_id=${orderId}`,
      cancel_url: `${process.env.FRONTEND_URL}/user/payment/cancel?order_id=${orderId}`,
      metadata: {
        orderId: orderId.toString(),
        userId: userId.toString(),
        paymentOption: order.paymentOption,
        orderNumber: order.orderNumber,
      },
    });

    // 5. Save session ID
    order.stripeSessionId = session.id;
    await order.save();

    console.log("✅ Stripe session created:", session.id);
    console.log("Redirect URL:", session.url);

    res.json({
      success: true,
      url: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    console.error("❌ Stripe error:", error.message);

    // Better error messages
    if (error.type === "StripeInvalidRequestError") {
      return res.status(400).json({
        success: false,
        message: "Stripe configuration issue. Please complete business setup.",
        fix_url: "https://dashboard.stripe.com/settings/business",
      });
    }

    res.status(500).json({
      success: false,
      message: "Payment failed",
      error: error.message,
    });
  }
};

// ✅ STRIPE WEBHOOK HANDLER (SAME)
exports.handleWebhook = async (req, res) => {
  console.log("=== 🔔 WEBHOOK RECEIVED ===");
  console.log("📦 Headers:", JSON.stringify(req.headers, null, 2));
  console.log("📧 Raw body available:", !!req.body);

  const sig = req.headers["stripe-signature"];

  if (!sig) {
    console.error("❌ No stripe-signature header");
    return res.status(400).send("Webhook Error: No signature");
  }

  let event;
  try {
    console.log("🔐 Verifying signature...");
    event = stripe.webhooks.constructEvent(
      req.rawBody || req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
    console.log("✅ Signature verified");
    console.log("🎯 Event type:", event.type);
    console.log("🎯 Event ID:", event.id);
  } catch (err) {
    console.error("❌ Webhook signature verification failed:", err.message);
    console.error("Full error:", err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  console.log("🔄 Handling event type:", event.type);

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      console.log("💰 Session completed:", session.id);
      console.log("📋 Session metadata:", session.metadata);
      console.log("💵 Payment status:", session.payment_status);
      console.log("💳 Payment intent:", session.payment_intent);
      await handleSuccessfulPayment(session);
      break;
    }

    case "checkout.session.expired": {
      const session = event.data.object;
      await handleExpiredPayment(session);
      break;
    }

    case "charge.refunded": {
      const charge = event.data.object;
      await handleRefund(charge);
      break;
    }

    default:
      console.log(`ℹ️ Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
};

// ✅ HANDLE SUCCESSFUL PAYMENT (UPDATED FOR NEW MODEL)
async function handleSuccessfulPayment(session) {
  try {
    console.log("=== 💰 HANDLING SUCCESSFUL PAYMENT ===");
    console.log("Session ID:", session.id);
    console.log("Metadata:", session.metadata);

    if (!session.metadata) {
      console.error("❌ No metadata in session");
      return;
    }

    const { orderId, userId, paymentOption } = session.metadata;

    if (!orderId || !userId || !paymentOption) {
      console.error("❌ Missing metadata fields");
      console.error("Order ID:", orderId);
      console.error("User ID:", userId);
      console.error("Payment Option:", paymentOption);
      return;
    }

    console.log("📋 Parsed metadata:");
    console.log("- Order ID:", orderId);
    console.log("- User ID:", userId);
    console.log("- Payment Option:", paymentOption);

    // Find order
    const order = await Order.findOne({
      _id: orderId,
      user: userId,
    });

    if (!order) {
      console.error("❌ Order not found:", orderId);
      return;
    }

    console.log("📦 Order found:", order.orderNumber);
    console.log("📊 Current payment status:", order.paymentStatus);
    console.log("📊 Current order status:", order.status);
    console.log("💰 Total amount:", order.totalAmount);

    // ✅ UPDATED: Using model-compatible enum values
    if (paymentOption === "100") {
      order.paymentStatus = "100_paid"; // ✅ Model ke according
      order.advancePayment = order.totalAmount;
      order.remainingPayment = 0;
      console.log("✅ 100% payment processed -> paymentStatus: 100_paid");
    } else if (paymentOption === "50") {
      order.paymentStatus = "50_paid"; // ✅ Model ke according
      order.advancePayment = Math.round(order.totalAmount * 0.5);
      order.remainingPayment = order.totalAmount - order.advancePayment;
      console.log("✅ 50% advance payment processed -> paymentStatus: 50_paid");
    } else {
      console.error("❌ Invalid payment option:", paymentOption);
      return;
    }

    // ✅ UPDATE ORDER STATUS
    order.status = "pending_staff"; // Payment complete, now waiting for staff
    order.stripePaymentId = session.payment_intent;
    order.stripeSessionId = session.id;

    await order.save();

    console.log("🎉 Order updated successfully!");
    console.log("New payment status:", order.paymentStatus);
    console.log("New order status:", order.status);
    console.log("Advance paid:", order.advancePayment);
    console.log("Remaining:", order.remainingPayment);

    // Clear cart
    const cartDeleted = await Cart.findOneAndDelete({ user: userId });
    console.log("🛒 Cart cleared:", !!cartDeleted);

    // Create notification for user
    const notification = new Notification({
      user: userId,
      title: "Payment Successful!",
      message: `Your payment of Rs. ${order.advancePayment} for order #${order.orderNumber} was successful. Order is now pending staff acceptance.`,
      type: "payment",
      priority: "high",
      relatedOrder: order._id,
    });
    await notification.save();
    console.log("📧 Notification created for user");
  } catch (error) {
    console.error("❌ Error in handleSuccessfulPayment:");
    console.error("Message:", error.message);
    console.error("Stack:", error.stack);
  }
}

// ✅ HANDLE EXPIRED PAYMENT (SAME)
async function handleExpiredPayment(session) {
  try {
    const orderId = session.metadata?.orderId;

    if (!orderId) {
      console.error("No orderId in expired session");
      return;
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        status: "cancelled",
        cancelledBy: "system",
        cancellationReason: "Payment session expired",
      },
      { new: true },
    );

    console.log("❌ Payment expired for order:", order?.orderNumber);
  } catch (error) {
    console.error("Error handling expired payment:", error);
  }
}

// ✅ HANDLE REFUND (UPDATED FOR NEW MODEL)
async function handleRefund(charge) {
  try {
    // Find order by payment intent ID
    const order = await Order.findOne({
      stripePaymentId: charge.payment_intent,
    });

    if (order) {
      order.paymentStatus = "refunded"; // ✅ Model ke according
      order.refundStatus = "refunded"; // ✅ refundStatus field ke according
      order.refundAmount = charge.amount_refunded / 100;
      order.refundedAt = new Date();
      await order.save();

      console.log("✅ Refund processed for order:", order.orderNumber);
    }
  } catch (error) {
    console.error("❌ Error handling refund:", error);
  }
}

// ✅ VERIFY PAYMENT (SAME)
exports.verifyPayment = async (req, res) => {
  try {
    const { sessionId } = req.params;
    console.log("🔍 Verifying payment for session:", sessionId);

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "paid") {
      // Payment successful
      const order = await Order.findOne({ stripeSessionId: sessionId });

      res.json({
        success: true,
        paid: true,
        orderId: order?._id,
        orderNumber: order?.orderNumber,
        amount: session.amount_total / 100,
      });
    } else {
      res.json({
        success: true,
        paid: false,
        message: "Payment not completed",
      });
    }
  } catch (error) {
    console.error("Verify payment error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to verify payment",
    });
  }
};

// ✅ TEST STRIPE CONNECTION (SAME)
exports.testStripe = async (req, res) => {
  try {
    const charges = await stripe.charges.list({ limit: 1 });

    res.json({
      success: true,
      stripe: "Connected",
      can_accept_payments: true,
    });
  } catch (error) {
    res.json({
      success: false,
      error: error.message,
      help: "Complete Stripe setup at: https://dashboard.stripe.com/settings/business",
    });
  }
};

// ✅ DEBUG WEBHOOK (SAME)
exports.debugWebhook = async (req, res) => {
  console.log("=== 🐛 WEBHOOK DEBUG ===");
  console.log("Method:", req.method);
  console.log("Headers:", JSON.stringify(req.headers, null, 2));
  console.log("Body:", JSON.stringify(req.body, null, 2));

  res.json({
    success: true,
    message: "Webhook debug received",
    headers: req.headers,
    body: req.body,
  });
};
