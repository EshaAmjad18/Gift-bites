// backend/src/routes/admin/users.js
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../../middleware/authMiddleware');
const roleCheck = require('../../middleware/roleCheck');

const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  toggleBlockUser,
  resetUserStrikes,
  deleteUser,
  getUserStats
} = require('../../controllers/admin/userController');

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Admin only
router.get('/', authMiddleware, roleCheck('admin'), getAllUsers);

// @route   GET /api/admin/users/stats
// @desc    Get user statistics
// @access  Admin only
router.get('/stats', authMiddleware, roleCheck('admin'), getUserStats);

// @route   POST /api/admin/users/create
// @desc    Create a new user
// @access  Admin only
router.post('/create', authMiddleware, roleCheck('admin'), createUser);

// @route   GET /api/admin/users/:userId
// @desc    Get single user by ID
// @access  Admin only
router.get('/:userId', authMiddleware, roleCheck('admin'), getUserById);

// @route   PUT /api/admin/users/:userId
// @desc    Update user details
// @access  Admin only
router.put('/:userId', authMiddleware, roleCheck('admin'), updateUser);

// @route   PUT /api/admin/users/:userId/toggle-block
// @desc    Toggle user block status
// @access  Admin only
router.put('/:userId/toggle-block', authMiddleware, roleCheck('admin'), toggleBlockUser);

// @route   PUT /api/admin/users/:userId/reset-strikes
// @desc    Reset user strikes to 0
// @access  Admin only
router.put('/:userId/reset-strikes', authMiddleware, roleCheck('admin'), resetUserStrikes);

// @route   DELETE /api/admin/users/:userId
// @desc    Delete a user
// @access  Admin only
router.delete('/:userId', authMiddleware, roleCheck('admin'), deleteUser);

module.exports = router;