//src/routes/user/profile.js
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../../middleware/authMiddleware');
const {
  getProfile,
  updateProfile,
  getUserStats,
  getUserOrders,
  checkUpdateEligibility
} = require('../../controllers/user/profileController');
const User = require('../../models/User');



// Debug route 1: Check auth middleware
router.get('/debug-auth', authMiddleware, (req, res) => {
  console.log('🔍 /debug-auth called');
  
  res.json({
    success: true,
    authInfo: {
      userId: req.userId,
      user: req.user ? {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role
      } : null,
      timestamp: new Date().toISOString()
    }
  });
});

// Debug route 2: Check all users (temporary - remove in production)
router.get('/debug-users', authMiddleware, async (req, res) => {
  try {
    const users = await User.find({}).select('_id name email role createdAt').limit(10);
    
    res.json({
      success: true,
      currentUserId: req.userId,
      totalUsers: await User.countDocuments(),
      users: users
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Debug route 3: Check specific user
router.get('/debug-user/:id', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    res.json({
      success: true,
      searchedId: req.params.id,
      userFound: !!user,
      user: user
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});



// All routes require authentication
router.use(authMiddleware);

// Profile routes
router.get('/', getProfile);
router.put('/', updateProfile);

// Add these endpoints if missing
router.get('/stats', getUserStats);
router.get('/orders', getUserOrders);
// Or you can use this single endpoint for orders
router.get('/recent-orders', getUserOrders);

router.get('/check-update', checkUpdateEligibility);

module.exports = router;