const Order = require('../../models/Order');
const User = require('../../models/User');

const getPerformanceData = async (req, res) => {
  try {
    const { range = '7d' } = req.query;
    
    const now = new Date();
    let startDate;
    
    switch(range) {
      case '7d':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case '30d':
        startDate = new Date(now.setDate(now.getDate() - 30));
        break;
      case '90d':
        startDate = new Date(now.setDate(now.getDate() - 90));
        break;
      case '1y':
        startDate = new Date(now.setDate(now.getDate() - 365));
        break;
      default:
        startDate = new Date(now.setDate(now.getDate() - 7));
    }

    const orders = await Order.find({ 
      createdAt: { $gte: startDate },
      status: 'completed'
    });
    
    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const totalOrders = orders.length;
    const newUsers = await User.countDocuments({
      createdAt: { $gte: startDate }
    });

    const dailyRevenue = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      const dayOrders = await Order.find({
        createdAt: { $gte: date, $lte: endOfDay },
        status: 'completed'
      });
      
      const dayRevenue = dayOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
      
      dailyRevenue.push({
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        revenue: dayRevenue,
        orders: dayOrders.length
      });
    }

    const cafeteriaStats = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: '$cafeteria',
          totalRevenue: { $sum: '$totalAmount' },
          totalOrders: { $sum: 1 }
        }
      },
      {
        $sort: { totalRevenue: -1 }
      },
      {
        $limit: 5
      }
    ]);

    const topCafeterias = cafeteriaStats.map(cafe => ({
      name: cafe._id || 'Unknown',
      revenue: cafe.totalRevenue,
      orders: cafe.totalOrders
    }));

    const recentOrders = await Order.find({ 
      status: 'completed' 
    })
    .sort({ createdAt: -1 })
    .limit(10)
    .populate('user', 'name')
    .lean();

    const formattedRecentOrders = recentOrders.map(order => ({
      id: order._id.toString().slice(-6).toUpperCase(),
      customer: order.user?.name || 'Anonymous',
      cafeteria: order.cafeteria || 'Unknown',
      amount: order.totalAmount || 0,
      status: 'Completed',
      time: new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }));

    res.status(200).json({
      success: true,
      data: {
        totalRevenue,
        totalOrders,
        totalUsers: newUsers,
        totalViolations: 0,
        revenueChange: 24,
        ordersChange: 18,
        usersChange: 12,
        violationsChange: -5,
        dailyRevenue,
        topCafeterias,
        recentOrders: formattedRecentOrders
      }
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

module.exports = { getPerformanceData };