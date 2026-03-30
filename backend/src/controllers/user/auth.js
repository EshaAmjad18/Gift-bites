// backend/src/controllers/user/auth.js (FIXED VERSION)
const User = require('../../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ✅ User Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and password are required' 
      });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    // Check if user is blocked
    if (user.isBlocked) {
      return res.status(403).json({ 
        success: false, 
        message: 'Your account is blocked. Please contact admin.' 
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = jwt.sign(
      { 
        id: user._id, 
        email: user.email, 
        role: 'user',  // ✅ Explicitly set role as 'user'
        studentId: user.studentId,
        name: user.name
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Remove password from response
    const userResponse = {
      _id: user._id,
      id: user._id,
      name: user.name,
      email: user.email,
      role: 'user', // ✅ Explicitly set
      studentId: user.studentId,
      phone: user.phone,
      isBlocked: user.isBlocked,
      violations: user.violations,
      strikes: user.strikes,
      pendingFines: user.pendingFines,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt
    };

    console.log('✅ User logged in:', {
      email: user.email,
      role: 'user',
      studentId: user.studentId
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: userResponse
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Server error during login' 
    });
  }
};

// ✅ Get User Profile
const getProfile = async (req, res) => {
  try {
    console.log('🔍 Getting profile for user ID:', req.userId);
    
    const user = await User.findById(req.userId)
      .select('-password')
      .lean(); // Convert to plain object
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Ensure role is set
    user.role = 'user';
    
    console.log('✅ Profile found:', {
      id: user._id,
      name: user.name,
      email: user.email
    });

    res.status(200).json({
      success: true,
      user
    });

  } catch (error) {
    console.error('❌ Get profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// ✅ Update User Profile
const updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    
    console.log('🔍 Updating profile for user ID:', req.userId);
    
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Update fields
    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;

    await user.save();

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;
    userResponse.role = 'user'; // ✅ Ensure role is set

    console.log('✅ Profile updated:', {
      name: user.name,
      phone: user.phone
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: userResponse
    });

  } catch (error) {
    console.error('❌ Update profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// ✅ Change Password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Current and new password are required' 
      });
    }

    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: 'Current password is incorrect' 
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// ✅ Export all functions
module.exports = {
  login,
  getProfile,
  updateProfile,
  changePassword
};