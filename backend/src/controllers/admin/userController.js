// backend/src/controllers/admin/userController.js
const User = require('../../models/User');
const bcrypt = require('bcryptjs');

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const { search } = req.query;
    
    let query = {};
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { studentId: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch users' 
    });
  }
};

// Get single user by ID
exports.getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch user' 
    });
  }
};

// Create new user
exports.createUser = async (req, res) => {
  try {
    const { name, email, studentId, password, phone } = req.body;

    // Validation
    if (!name || !email || !studentId || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { studentId }] 
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: existingUser.email === email 
          ? 'Email already registered' 
          : 'Student ID already exists'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = new User({
      name,
      email,
      studentId,
      password: hashedPassword,
      phone: phone || '',
      role: 'user'
    });

    await user.save();

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: userResponse
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create user' 
    });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, email, studentId, phone, isBlocked, blockReason } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if email or studentId already exists (for other users)
    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ email, _id: { $ne: userId } });
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: 'Email already registered by another user'
        });
      }
    }

    if (studentId && studentId !== user.studentId) {
      const existingStudentId = await User.findOne({ studentId, _id: { $ne: userId } });
      if (existingStudentId) {
        return res.status(400).json({
          success: false,
          message: 'Student ID already exists'
        });
      }
    }

    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (studentId) user.studentId = studentId;
    if (phone !== undefined) user.phone = phone;
    
    // Handle blocking/unblocking
    if (isBlocked !== undefined) {
      user.isBlocked = isBlocked;
      if (isBlocked) {
        user.blockReason = blockReason || 'Account blocked by admin';
        user.blockedAt = new Date();
      } else {
        user.blockReason = '';
        user.blockedAt = null;
      }
    }

    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      success: true,
      message: 'User updated successfully',
      data: userResponse
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update user' 
    });
  }
};

// Toggle user block status
exports.toggleBlockUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isBlocked } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isBlocked = isBlocked !== undefined ? isBlocked : !user.isBlocked;
    
    if (user.isBlocked) {
      user.blockReason = 'Account blocked by admin';
      user.blockedAt = new Date();
    } else {
      user.blockReason = '';
      user.blockedAt = null;
    }

    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      success: true,
      message: user.isBlocked ? 'User blocked successfully' : 'User unblocked successfully',
      data: userResponse
    });
  } catch (error) {
    console.error('Error toggling block status:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update user status' 
    });
  }
};

// Reset user strikes
exports.resetUserStrikes = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.strikes = 0;
    user.isBlocked = false;
    user.blockReason = '';
    user.blockedAt = null;
    
    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      success: true,
      message: 'User strikes reset successfully',
      data: userResponse
    });
  } catch (error) {
    console.error('Error resetting strikes:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to reset strikes' 
    });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user has pending orders or fines
    // (You might want to add additional checks here)

    await User.findByIdAndDelete(userId);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete user' 
    });
  }
};

// Get user statistics
exports.getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isBlocked: false });
    const blockedUsers = await User.countDocuments({ isBlocked: true });
    const usersWithStrikes = await User.countDocuments({ strikes: { $gt: 0 } });
    
    // Get users with pending fines
    const usersWithFines = await User.aggregate([
      { $match: { pendingFines: { $gt: 0 } } },
      { $group: {
        _id: null,
        count: { $sum: 1 },
        totalFines: { $sum: '$pendingFines' }
      }}
    ]);

    // Get recent registrations (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentRegistrations = await User.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });

    res.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        blockedUsers,
        usersWithStrikes,
        usersWithPendingFines: usersWithFines[0]?.count || 0,
        totalPendingFines: usersWithFines[0]?.totalFines || 0,
        recentRegistrations,
        registrationRate: Math.round((recentRegistrations / totalUsers) * 100) || 0
      }
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch user statistics' 
    });
  }
};