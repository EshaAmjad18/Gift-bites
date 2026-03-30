// backend/src/controllers/staff/dashboardController.js
const Order = require('../../models/Order');
const Staff = require('../../models/Staff');

exports.getDashboardStats = async (req, res) => {
  try {
    console.log('📊 Fetching dashboard stats for staff:', req.user._id);
    
    // Get staff details
    const staff = await Staff.findById(req.user._id);
    if (!staff) {
      return res.status(404).json({ 
        success: false, 
        message: 'Staff not found' 
      });
    }

    console.log('📍 Staff cafeteria:', staff.cafeteria);

    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get start of week (Monday)
    const startOfWeek = new Date(today);
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);

    // 1. Today's Sales
    const todayOrders = await Order.find({
      cafeteria: staff.cafeteria,
      createdAt: { $gte: today, $lt: tomorrow },
      status: { $nin: ['cancelled', 'rejected'] }
    });

    const dailySales = todayOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const todayOrdersCount = todayOrders.length;

    // 2. Active Orders (accepted, preparing, ready)
    const activeOrders = await Order.countDocuments({
      cafeteria: staff.cafeteria,
      status: { $in: ['accepted', 'preparing', 'ready'] }
    });

    // 3. Total Orders
    const totalOrders = await Order.countDocuments({
      cafeteria: staff.cafeteria
    });

    // 4. Weekly Revenue (this week)
    const weeklyOrders = await Order.find({
      cafeteria: staff.cafeteria,
      createdAt: { $gte: startOfWeek },
      status: { $nin: ['cancelled', 'rejected'] }
    });

    const weeklyRevenue = weeklyOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

    // 5. Pending Refunds
    const pendingRefunds = await Order.countDocuments({
      cafeteria: staff.cafeteria,
      status: { $in: ['cancelled', 'rejected'] },
      refundStatus: { $ne: 'completed' }
    });

    console.log('📈 Stats calculated:', {
      dailySales,
      todayOrdersCount,
      activeOrders,
      totalOrders,
      weeklyRevenue,
      pendingRefunds
    });

    res.json({
      success: true,
      data: {
        dailySales,
        todayOrders: todayOrdersCount,
        activeOrders,
        totalOrders,
        weeklyRevenue,
        pendingRefunds
      }
    });

  } catch (error) {
    console.error('❌ Dashboard stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch dashboard stats',
      error: error.message 
    });
  }
};