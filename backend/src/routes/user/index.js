// backend/src/routes/user/index.js
const express = require('express');
const router = express.Router();

// Import route files
const authRoutes = require('./auth');
const menuRoutes = require('./menu');
const profileRoutes = require('./profile');


// Use routes
router.use('/auth', authRoutes);
router.use('/menu', menuRoutes);
router.use('/profile', profileRoutes); 
module.exports = router;