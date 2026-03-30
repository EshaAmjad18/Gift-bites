// backend/src/routes/staff/auth.js (UPDATED)
const express = require('express');
const router = express.Router();

// Import controller
const staffController = require('../../controllers/staff/auth');

// Debug log
console.log('Staff controller functions:', Object.keys(staffController));

// Staff Login - use loginStaff (not login)
router.post('/login', staffController.loginStaff);

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ 
    success: true,
    message: 'Staff auth API is working!',
    endpoints: [
      'POST /api/staff/auth/login',
      'GET /api/staff/auth/test'
    ]
  });
});

module.exports = router;