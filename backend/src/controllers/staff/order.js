//src/controllers/staff/order.js

const Order = require("../../models/Order");
const Staff = require("../../models/Staff");
const Notification = require("../../models/Notification");
const { createNotification } = require("../../utils/notificationHelper"); // ✅ Already hai

const getOrders = async (req, res) => {
  try {
    console.log("Staff fetching orders for cafeteria:", req.staff.cafeteria);

    // Find staff's cafeteria name
    const staff = await Staff.findById(req.staff._id);
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Staff not found",
      });
    }

    console.log("Staff cafeteria:", staff.cafeteria);

    // Get orders for this cafeteria
    const orders = await Order.find({
      cafeteria: staff.cafeteria,
    })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    console.log(`Found ${orders.length} orders for ${staff.cafeteria}`);

    res.json({
      success: true,
      orders: orders.map((order) => ({
        _id: order._id,
        orderNumber: order.orderNumber,
        user: order.user,
        cafeteria: order.cafeteria,
        items: order.items,
        totalAmount: order.totalAmount,
        advancePayment: order.advancePayment,
        remainingPayment: order.remainingPayment,
        paymentOption: order.paymentOption,
        paymentStatus: order.paymentStatus,
        status: order.status,
        createdAt: order.createdAt,
        readyAt: order.readyAt,
        notes: order.notes,
        canCancel: order.canCancel(),
      })),
    });
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
};

// ===============================
// Update order status (staff) - FIXED VERSION
// ===============================
const updateOrderStatus = async (req, res) => {
  console.log("🔧 BACKEND: Update Order Status");
  console.log("Params:", req.params);
  console.log("Body:", req.body);
  console.log("Staff ID:", req.staff?._id);
  console.log("Staff cafeteria:", req.staff?.cafeteria);

  const { status } = req.body;
  const { id } = req.params;

  try {
    console.log("Updating order status:", { orderId: id, status });

    // Find order
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Find staff and check cafeteria
    const staff = await Staff.findById(req.staff._id);
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Staff not found",
      });
    }

    // Check if order belongs to staff's cafeteria
    if (order.cafeteria !== staff.cafeteria) {
      return res.status(403).json({
        success: false,
        message:
          "Unauthorized access - Order does not belong to your cafeteria",
      });
    }

    // ✅ FIX 1: Check valid status transitions
    const validTransitions = {
      pending_staff: ["accepted", "rejected"],
      accepted: ["preparing"],
      preparing: ["ready"],
      ready: ["picked", "not_picked"],
      picked: [],
      not_picked: [],
      rejected: [],
    };

    if (!validTransitions[order.status]?.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status transition from ${order.status} to ${status}`,
      });
    }

    // Update status with timestamps
    const updateData = { status };

    if (status === "accepted") {
      updateData.acceptedAt = new Date();
    } else if (status === "preparing") {
      updateData.preparingAt = new Date();
    } else if (status === "ready") {
      updateData.readyAt = new Date();
      // Set pickup deadline (2 hours)
      updateData.pickupDeadline = new Date(Date.now() + 2 * 60 * 60000);
    } else if (status === "picked") {
      updateData.pickedAt = new Date();
    } else if (status === "rejected") {
      updateData.rejectedAt = new Date();
    }
    // ✅ FIX 2: Handle not_picked status
    else if (status === "not_picked") {
      updateData.notPickedAt = new Date();
      // Apply 10% penalty
      const penalty = order.totalAmount * 0.1;
      order.totalAmount += penalty;
      order.penaltyAmount = penalty;
      await order.save(); // Save penalty immediately
    }

    const updatedOrder = await Order.findByIdAndUpdate(id, updateData, {
      new: true,
    }).populate("user", "name email");

    // ✅ FIX 3: Create notification using helper
    await createNotification(
      order.user,
      "Order Status Updated",
      `Your order #${order.orderNumber} status changed to ${status}${status === "not_picked" ? " (10% penalty applied)" : ""}`,
      "order",
      { orderId: order._id },
    );

    console.log("✅ Order status updated successfully:", order.orderNumber);

    res.json({
      success: true,
      message: `Order status updated to ${status}${status === "not_picked" ? " (10% penalty applied)" : ""}`,
      order: updatedOrder,
    });
  } catch (error) {
    console.error("❌ Failed to update order status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update order status",
      error: error.message,
    });
  }
};

// ===============================
// Send warning to user - COMPLETE VERSION
// ===============================
const sendWarning = async (req, res) => {
  try {
    console.log("⚠️ SEND WARNING - Request received");
    console.log("Order ID:", req.params.id);

    const { id } = req.params;

    // Find order with user populated
    const order = await Order.findById(id).populate(
      "user",
      "name email strikes isBlocked",
    );

    if (!order) {
      console.log("❌ Order not found");
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    console.log("✅ Order found:", order.orderNumber);
    console.log("Order user:", order.user);
    console.log("Current order warningCount:", order.warningCount || 0);

    // Check if order is in not_picked status
    if (order.status !== "not_picked") {
      console.log("❌ Order not in not_picked status:", order.status);
      return res.status(400).json({
        success: false,
        message: 'Warning can only be sent for orders marked as "not picked"',
      });
    }

    // Get current warning count
    const currentWarnings = order.warningCount || 0;

    // Check if already has 3 warnings
    if (currentWarnings >= 3) {
      console.log("❌ Already has 3 warnings");
      return res.status(400).json({
        success: false,
        message: "Maximum warnings (3) already sent for this order",
      });
    }

    // ✅ UPDATE: Increment warning count on ORDER
    order.warningCount = currentWarnings + 1;
    order.lastWarningAt = new Date();

    // ✅ UPDATE: Also add strike to ORDER
    const currentOrderStrikes = order.strikes || 0;
    order.strikes = currentOrderStrikes + 1;
    order.lastStrikeAt = new Date();

    // ✅ UPDATE: Add strike to USER if exists
    if (order.user) {
      const user = order.user;
      const currentUserStrikes = user.strikes || 0;

      // Add strike to user
      user.strikes = currentUserStrikes + 1;
      user.lastStrikeAt = new Date();

      // Check if user should be blocked (3 strikes)
      if (user.strikes >= 3) {
        user.isBlocked = true;
        user.blockedAt = new Date();
        user.blockReason = "3 strikes for not picking up orders";
        console.log(`🚨 User ${user.email} blocked due to 3 strikes`);
      }

      await user.save();
      console.log("✅ User strikes updated:", {
        name: user.name,
        strikes: user.strikes,
        isBlocked: user.isBlocked,
      });
    }

    await order.save();
    console.log("✅ Order updated:", {
      warningCount: order.warningCount,
      strikes: order.strikes,
    });

    // ✅ FIXED: Create notification using helper
    if (order.user) {
      await createNotification(
        order.user._id,
        "⚠️ Warning Issued",
        `You have received a warning for Order #${order.orderNumber}.\n` +
          `• Warnings: ${order.warningCount}/3\n` +
          `• Total Strikes: ${order.user.strikes || 0}\n` +
          (order.user.strikes >= 3
            ? "🚨 Your account has been blocked!\n"
            : ""),
        "warning",
        { orderId: order._id },
      );
      console.log("✅ Notification created");
    }

    // Send response with ALL needed data
    const responseData = {
      success: true,
      message: `Warning sent successfully. User now has ${order.warningCount}/3 warnings.`,
      warningCount: order.warningCount,
      strikeCount: order.strikes, // Order strikes
      userStrikeCount: order.user?.strikes || 0, // User strikes
      isBlocked: order.user?.isBlocked || false,
      order: {
        _id: order._id,
        orderNumber: order.orderNumber,
        warningCount: order.warningCount,
        strikes: order.strikes,
        status: order.status,
      },
      user: order.user
        ? {
            _id: order.user._id,
            name: order.user.name,
            strikes: order.user.strikes,
            isBlocked: order.user.isBlocked,
          }
        : null,
    };

    console.log("✅ Sending response:", responseData);
    res.json(responseData);
  } catch (error) {
    console.error("❌ Failed to send warning:", error);
    console.error("Error stack:", error.stack);

    res.status(500).json({
      success: false,
      message: "Failed to send warning",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// ===============================
// Get order statistics
// ===============================
const getOrderStats = async (req, res) => {
  try {
    const staff = await Staff.findById(req.staff._id);
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Staff not found",
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const stats = await Order.aggregate([
      {
        $match: {
          cafeteria: staff.cafeteria,
          createdAt: { $gte: today, $lt: tomorrow },
        },
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: "$totalAmount" },
          pendingCount: {
            $sum: {
              $cond: [
                {
                  $in: ["$status", ["pending_staff", "accepted", "preparing"]],
                },
                1,
                0,
              ],
            },
          },
          readyCount: {
            $sum: { $cond: [{ $eq: ["$status", "ready"] }, 1, 0] },
          },
          completedCount: {
            $sum: { $cond: [{ $eq: ["$status", "picked"] }, 1, 0] },
          },
        },
      },
    ]);

    res.json({
      success: true,
      stats: stats[0] || {
        totalOrders: 0,
        totalRevenue: 0,
        pendingCount: 0,
        readyCount: 0,
        completedCount: 0,
      },
    });
  } catch (error) {
    console.error("Failed to get order stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get order stats",
      error: error.message,
    });
  }
};

// ===============================
// Get today's orders
// ===============================
const getTodaysOrders = async (req, res) => {
  try {
    const staff = await Staff.findById(req.staff._id);
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Staff not found",
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const orders = await Order.find({
      cafeteria: staff.cafeteria,
      createdAt: { $gte: today, $lt: tomorrow },
    })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    // Categorize orders
    const categorizedOrders = {
      new: orders.filter((order) => order.status === "pending_staff"),
      preparing: orders.filter(
        (order) => order.status === "accepted" || order.status === "preparing",
      ),
      ready: orders.filter((order) => order.status === "ready"),
      completed: orders.filter((order) => order.status === "picked"),
      rejected: orders.filter((order) => order.status === "rejected"),
      not_picked: orders.filter((order) => order.status === "not_picked"),
    };

    res.json({
      success: true,
      orders: categorizedOrders,
      counts: {
        new: categorizedOrders.new.length,
        preparing: categorizedOrders.preparing.length,
        ready: categorizedOrders.ready.length,
        completed: categorizedOrders.completed.length,
        rejected: categorizedOrders.rejected.length,
        not_picked: categorizedOrders.not_picked.length,
      },
    });
  } catch (error) {
    console.error("Failed to fetch today's orders:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch today's orders",
      error: error.message,
    });
  }
};

// ===============================
// ✅ FIXED: Mark cash received
// ===============================
const markCashReceived = async (req, res) => {
  try {
    console.log("💰 MARK CASH RECEIVED - Backend");
    console.log("Order ID:", req.params.id);
    console.log("Staff:", req.staff);

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check if order is from staff's cafeteria
    const staff = await Staff.findById(req.staff._id);
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Staff not found",
      });
    }

    if (order.cafeteria !== staff.cafeteria) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized - Order does not belong to your cafeteria",
      });
    }

    // Only for 50% paid orders
    if (order.paymentStatus !== "50_paid") {
      return res.status(400).json({
        success: false,
        message: "Only 50% advance orders can mark cash received",
      });
    }

    // Check if order is picked
    if (order.status !== "picked") {
      return res.status(400).json({
        success: false,
        message: "Order must be picked first before marking cash received",
      });
    }

    // Update payment
    order.paymentStatus = "cash_50_received";
    order.remainingPayment = 0;
    order.updatedAt = new Date();

    await order.save();

    console.log("✅ Cash marked received for order:", order.orderNumber);

    res.json({
      success: true,
      message: "Cash received and payment updated to 100%",
      order: {
        _id: order._id,
        orderNumber: order.orderNumber,
        paymentStatus: order.paymentStatus, // 'cash_50_received'
        advancePayment: order.advancePayment,
        remainingPayment: order.remainingPayment,
        totalAmount: order.totalAmount,
        // ✅ ADD THESE FIELDS FOR FRONTEND:
        status: order.status,
        user: order.user,
        items: order.items,
        cafeteria: order.cafeteria,
        createdAt: order.createdAt,
        readyAt: order.readyAt,
        warningCount: order.warningCount,
      },
    });
  } catch (error) {
    console.error("❌ Failed to mark cash received:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update payment",
      error: error.message,
    });
  }
};

// ✅ FIX 3: EXPORT ALL FUNCTIONS CORRECTLY
module.exports = {
  getOrders,
  updateOrderStatus,
  getOrderStats,
  sendWarning,
  getTodaysOrders,
  markCashReceived,
};
