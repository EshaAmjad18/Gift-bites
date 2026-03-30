//src/controller/user/profileController.js
const User = require('../../models/User');
const Order = require('../../models/Order');

/**
 * Get user profile (Updated Version)
 */

exports.getProfile = async (req, res) => {
  try {
    console.log('🔍 === GET PROFILE START ===');
    console.log('📦 req.userId:', req.userId);
    console.log('📦 req.user:', req.user);
    console.log('📦 req.headers:', req.headers);
    
    // Check if userId exists
    if (!req.userId) {
      console.error('❌ ERROR: req.userId is undefined!');
      console.error('   Auth middleware may not be setting req.userId properly');
      
      // Try to get from req.user
      if (req.user && req.user._id) {
        console.log('   Found user._id:', req.user._id);
        req.userId = req.user._id.toString();
      } else {
        return res.status(401).json({
          success: false,
          message: 'User ID not found in request'
        });
      }
    }
    
    const userId = req.userId;
    
    console.log('🔍 Looking for user with ID:', userId);
    console.log('   ID type:', typeof userId);
    console.log('   ID length:', userId.length);
    
    // Check if userId is valid MongoDB ObjectId
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.error('❌ ERROR: Invalid MongoDB ObjectId:', userId);
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }
    
    const user = await User.findById(userId).select('-password');
    
    console.log('🔍 User query result:', user ? 'FOUND' : 'NOT FOUND');
    
    if (!user) {
      console.error('❌ ERROR: User not found in database');
      console.error('   Searched ID:', userId);
      
      // Log all users for debugging
      const allUsers = await User.find({}).select('_id email name').limit(5);
      console.log('   First 5 users in DB:', allUsers);
      
      return res.status(404).json({
        success: false,
        message: 'User not found in database',
        debug: {
          searchedId: userId,
          totalUsers: await User.countDocuments()
        }
      });
    }
    
    console.log('✅ User found:', {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    });
    
    // Get user stats
    console.log('📊 Getting order statistics...');
    const [orderStats] = await Order.aggregate([
      { $match: { user: user._id } },
      { 
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          completedOrders: { 
            $sum: { $cond: [{ $in: ['$status', ['picked', 'completed']] }, 1, 0] } 
          },
          totalSpent: { 
            $sum: { 
              $cond: [{ $in: ['$status', ['picked', 'completed']] }, '$totalAmount', 0] 
            } 
          }
        }
      }
    ]);
    
    console.log('📊 Order stats:', orderStats);
    
    const response = {
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        studentId: user.studentId,
        phone: user.phone || '',
        role: user.role,
        isBlocked: user.isBlocked,
        strikes: user.strikes || 0,
        pendingFines: user.pendingFines || 0,
        totalOrders: user.totalOrders || 0,
        completedOrders: user.completedOrders || 0,
        totalSpent: user.totalSpent || 0,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      },
      // Add stats directly in response
      totalOrders: orderStats?.totalOrders || 0,
      completedOrders: orderStats?.completedOrders || 0,
      totalSpent: orderStats?.totalSpent || 0,
      // User specific stats
      strikes: user.strikes || 0,
      pendingFines: user.pendingFines || 0,
      favoriteItems: user.favorites?.length || 0
    };
    
    console.log('✅ === GET PROFILE SUCCESS ===');
    console.log('📦 Response data prepared');
    
    res.json(response);
    
  } catch (error) {
    console.error('❌ Get profile error:', error);
    console.error('❌ Error stack:', error.stack);
    
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
/**
 * 
 * Update user profile (only allowed fields)
 */
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const { name, phone } = req.body;
    
    console.log('Updating profile for user:', userId);
    console.log('Update data:', { name, phone });
    
    // Allowed fields to update
    const updateData = {};
    if (name) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    
    // Check if anything to update
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update'
      });
    }
    
    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        studentId: user.studentId,
        phone: user.phone || '',
        role: user.role
      }
    });
    
  } catch (error) {
    console.error('Update profile error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        error: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
};

/**
 * Get user statistics
 */
exports.getUserStats = async (req, res) => {
  try {
    const userId = req.userId;
    
    const [orderStats, user] = await Promise.all([
      Order.aggregate([
        { $match: { user: userId } },
        { 
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            completedOrders: { 
              $sum: { $cond: [{ $in: ['$status', ['picked', 'completed']] }, 1, 0] } 
            },
            pendingOrders: { 
              $sum: { $cond: [{ $in: ['$status', ['pending_staff', 'accepted', 'preparing', 'ready']] }, 1, 0] } 
            },
            cancelledOrders: { 
              $sum: { $cond: [{ $in: ['$status', ['cancelled', 'rejected']] }, 1, 0] } 
            },
            totalSpent: { 
              $sum: { 
                $cond: [{ $in: ['$status', ['picked', 'completed']] }, '$totalAmount', 0] 
              } 
            }
          }
        }
      ]),
      User.findById(userId).select('strikes pendingFines favorites')
    ]);
    
    const stats = orderStats[0] || {
      totalOrders: 0,
      completedOrders: 0,
      pendingOrders: 0,
      cancelledOrders: 0,
      totalSpent: 0
    };
    
    res.json({
      success: true,
      ...stats,
      strikes: user?.strikes || 0,
      pendingFines: user?.pendingFines || 0,
      favoriteItems: user?.favorites?.length || 0
    });
    
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics'
    });
  }
};

/**
 * Get user orders
 */
exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.userId;
    const { limit = 5 } = req.query;
    
    const orders = await Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .select('orderNumber totalAmount status createdAt cafeteria')
      .lean();
    
    res.json({
      success: true,
      orders
    });
    
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders'
    });
  }
};

/**
 * Check if user can update email/studentId
 */
exports.checkUpdateEligibility = async (req, res) => {
  try {
    const userId = req.userId;
    const { field, value } = req.query;
    
    if (!['email', 'studentId'].includes(field)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid field'
      });
    }
    
    // Check if value already exists for another user
    const existingUser = await User.findOne({
      [field]: value,
      _id: { $ne: userId }
    });
    
    res.json({
      success: true,
      canUpdate: !existingUser,
      message: existingUser 
        ? `${field} already exists` 
        : `${field} is available`
    });
    
  } catch (error) {
    console.error('Check update eligibility error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check eligibility'
    });
  }
};