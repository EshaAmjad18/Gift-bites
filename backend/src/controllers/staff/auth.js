// backend/controllers/staff/auth.js (UPDATED)
const Staff = require('../../models/Staff');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ===============================
// STAFF LOGIN
// ===============================
exports.loginStaff = async (req, res) => {
  try {
    console.log('REQ BODY:', req.body);

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and password required' 
      });
    }

    // find staff by email
    const staff = await Staff.findOne({ email });
    if (!staff) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    // compare password
    const isMatch = await bcrypt.compare(password, staff.password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    // generate token
    const token = jwt.sign(
      { 
        id: staff._id,
        email: staff.email,
        role: 'staff',
        cafeteria: staff.cafeteria 
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {  // ✅ Changed from 'staff' to 'user' for consistency
        id: staff._id,
        name: staff.name,
        email: staff.email,
        role: 'staff',
        cafeteria: staff.cafeteria
      }
    });

  } catch (error) {
    console.error('❌ STAFF LOGIN ERROR:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};