// backend/src/middleware/authMiddleware.js (UPDATED FIX)
const jwt = require('jsonwebtoken');
const Staff = require('../models/Staff');
const Admin = require('../models/Admin');
const User = require('../models/User');

// Generic auth middleware
const authMiddleware = async (req, res, next) => {
  let token;
  
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ 
      success: false,
      message: 'Not authorized, token missing' 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    console.log('🔍 Decoded JWT:', decoded); // ✅ Debug
    
    let user;
    if (decoded.role === 'admin') {
      user = await Admin.findById(decoded.id).select('-password');
    } else if (decoded.role === 'staff') {
      user = await Staff.findById(decoded.id).select('-password');
    } else if (decoded.role === 'user') {
      user = await User.findById(decoded.id).select('-password');
    } else {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid user role' 
      });
    }
    
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'User not found' 
      });
    }
    
    console.log('✅ User found:', {
      id: user._id,
      email: user.email,
      role: user.role
    }); // ✅ Debug
    
    // ✅ IMPORTANT: Ensure user._id exists
    if (!user._id) {
      console.error('❌ User object missing _id:', user);
      return res.status(500).json({ 
        success: false,
        message: 'User data corrupted' 
      });
    }
    
    req.user = user;
    req.userId = user._id.toString(); // ✅ Add userId for easy access
    next();
  } catch (error) {
    console.error('❌ Auth middleware error:', error);
    return res.status(401).json({ 
      success: false,
      message: 'Not authorized, token failed' 
    });
  }
};

// Staff-specific middleware (optional)
const protectStaff = async (req, res, next) => {
  let token;
  
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ 
      success: false,
      message: 'Not authorized, token missing' 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.role !== 'staff') {
      return res.status(401).json({ 
        success: false,
        message: 'Not authorized as staff' 
      });
    }
    
    const staff = await Staff.findById(decoded.id).select('-password');
    if (!staff) {
      return res.status(401).json({ 
        success: false,
        message: 'Staff not found' 
      });
    }
    
    if (staff.isBlocked) {
      return res.status(403).json({ 
        success: false,
        message: 'Staff account is blocked' 
      });
    }
    
    // Store as req.staff for easy access
    req.staff = staff;
    req.user = staff; // Also store as user for compatibility
    req.userId = staff._id.toString(); // ✅ Add this line
    next();
  } catch (error) {
    return res.status(401).json({ 
      success: false,
      message: 'Not authorized, token failed' 
    });
  }
};

// Export both
module.exports = {
  authMiddleware,
  protectStaff
};