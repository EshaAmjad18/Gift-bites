const Order = require("../models/Order");
const checkOrderWarnings = async (io) => {
  try {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

    const orders = await Order.find({
      status: "Ready",
      readyAt: { $lte: twoHoursAgo },
      warningIssued: false,
    });

    for (let order of orders) {
      order.status = "Not Picked";
      order.warningIssued = true;
      await order.save();

      // Emit Socket.IO event for frontend notification
      if (io) {
        io.emit("orderWarning", {
          orderId: order._id,
          status: order.status,
          cafeteria: order.cafeteria,
        });
      }

      console.log(`⚠️ Warning issued for order ${order._id}`);
    }
  } catch (error) {
    console.error("Warning checker error:", error.message);
  }
};

module.exports = checkOrderWarnings;
