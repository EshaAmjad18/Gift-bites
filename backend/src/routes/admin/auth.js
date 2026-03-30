// backend/src/routes/admin/auth.js (UPDATED)
const express = require('express');
const router = express.Router();

// Import controller
const adminController = require('../../controllers/admin/auth');

// Debug log
console.log('Admin controller functions:', Object.keys(adminController));

// Admin Login
router.post('/login', adminController.adminLogin);

// Admin Logout
router.post('/logout', adminController.adminLogout);

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ 
    success: true,
    message: 'Admin auth API is working!',
    endpoints: [
      'POST /api/admin/auth/login',
      'POST /api/admin/auth/logout',
      'GET /api/admin/auth/test'
    ]
  });
});

module.exports = router;