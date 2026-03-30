// backend/src/controllers/admin/dashboardController.js - CREATE NEW FILE
const Staff = require('../../models/Staff');
const Order = require('../../models/Order');
const User = require('../../models/User');

exports.getAllStaffsDashboard = async (req, res) => {
  try {
    console.log('👑 Admin fetching all staffs dashboard data');
    
    // Get all staff members
    const staffs = await Staff.find().select('name email cafeteria');
    console.log(`👥 Found ${staffs.length} staff members`);
    
    // Get all cafeterias
    const cafeterias = [...new Set(staffs.map(s => s.cafeteria))];
    
    // Calculate stats for each cafeteria
    const cafeteriaStats = await Promise.all(
      cafeterias.map(async (cafeteria) => {
        // Today's date
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        // This week
        const startOfWeek = new Date(today);
        const day = today.getDay();
        const diff = today.getDate() - day + (day === 0 ? -6 : 1);
        startOfWeek.setDate(diff);
        startOfWeek.setHours(0, 0, 0, 0);
        
        // Get orders for this cafeteria
        const todayOrders = await Order.find({
          cafeteria: cafeteria,
          createdAt: { $gte: today, $lt: tomorrow },
          status: { $nin: ['cancelled', 'rejected'] }
        });
        
        const weeklyOrders = await Order.find({
          cafeteria: cafeteria,
          createdAt: { $gte: startOfWeek },
          status: { $nin: ['cancelled', 'rejected'] }
        });
        
        const activeOrders = await Order.countDocuments({
          cafeteria: cafeteria,
          status: { $in: ['accepted', 'preparing', 'ready'] }
        });
        
        const pendingRefunds = await Order.countDocuments({
          cafeteria: cafeteria,
          status: { $in: ['cancelled', 'rejected'] },
          refundStatus: { $ne: 'completed' }
        });
        
        const totalOrders = await Order.countDocuments({
          cafeteria: cafeteria
        });
        
        // Get staff for this cafeteria
        const cafeteriaStaff = staffs.filter(s => s.cafeteria === cafeteria);
        
        return {
          cafeteria: cafeteria,
          staffCount: cafeteriaStaff.length,
          staff: cafeteriaStaff,
          stats: {
            dailySales: todayOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0),
            todayOrders: todayOrders.length,
            weeklyRevenue: weeklyOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0),
            activeOrders,
            totalOrders,
            pendingRefunds
          }
        };
      })
    );
    
    // Calculate total stats
    const totalStats = {
      totalDailySales: cafeteriaStats.reduce((sum, cafe) => sum + cafe.stats.dailySales, 0),
      totalTodayOrders: cafeteriaStats.reduce((sum, cafe) => sum + cafe.stats.todayOrders, 0),
      totalWeeklyRevenue: cafeteriaStats.reduce((sum, cafe) => sum + cafe.stats.weeklyRevenue, 0),
      totalActiveOrders: cafeteriaStats.reduce((sum, cafe) => sum + cafe.stats.activeOrders, 0),
      totalOrders: cafeteriaStats.reduce((sum, cafe) => sum + cafe.stats.totalOrders, 0),
      totalPendingRefunds: cafeteriaStats.reduce((sum, cafe) => sum + cafe.stats.pendingRefunds, 0),
      totalCafeterias: cafeterias.length,
      totalStaff: staffs.length
    };
    
    console.log('📊 Admin dashboard stats calculated');
    
    res.json({
      success: true,
      data: {
        cafeterias: cafeteriaStats,
        totalStats,
        timestamp: new Date()
      }
    });
    
  } catch (error) {
    console.error('❌ Admin dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin dashboard data',
      error: error.message
    });
  }
};

exports.getAdminDashboard = async (req, res) => {
  try {
    // Get all system stats
    const totalUsers = await User.countDocuments();
    const totalStaff = await Staff.countDocuments();
    
    // Get all orders for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayOrders = await Order.find({
      createdAt: { $gte: today, $lt: tomorrow }
    });
    
    const cancelledOrders = await Order.countDocuments({
      status: 'cancelled'
    });
    
    const rejectedOrders = await Order.countDocuments({
      status: 'rejected'
    });
    
    const pendingRefunds = await Order.countDocuments({
      status: { $in: ['cancelled', 'rejected'] },
      refundStatus: { $ne: 'completed' }
    });
    
    // Get cafeteria-wise performance
    const cafeterias = await Order.aggregate([
      {
        $group: {
          _id: '$cafeteria',
          totalSales: { $sum: '$totalAmount' },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { totalSales: -1 } }
    ]);
    
    res.json({
      success: true,
      data: {
        systemOverview: {
          totalUsers,
          totalStaff,
          totalCafeterias: 3, // Fixed 3 cafeterias
          totalOrders: todayOrders.length,
          cancelledOrders,
          rejectedOrders,
          pendingRefunds,
          totalRevenue: todayOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0)
        },
        cafeteriasPerformance: cafeterias,
        recentActivity: {
          lastUpdated: new Date(),
          activeSessions: 0 // Can add later
        }
      }
    });
    
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};