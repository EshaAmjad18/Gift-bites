// backend/src/routes/user/auth.js (UPDATED)
const express = require('express');
const router = express.Router();

// Import controller
const userController = require('../../controllers/user/auth');

// Debug log
console.log('User controller functions:', Object.keys(userController));

// User Login
router.post('/login', userController.login);

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ 
    success: true,
    message: 'User auth API is working!',
    endpoints: [
      'POST /api/user/auth/login',
      'GET /api/user/auth/test'
    ]
  });
});

module.exports = router;