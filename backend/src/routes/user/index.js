// // backend/src/routes/user/index.js
// const express = require('express');
// const router = express.Router();

// // Import route files
// const authRoutes = require('./auth');
// const menuRoutes = require('./menu');
// const profileRoutes = require('./profile');


// // Use routes
// router.use('/auth', authRoutes);
// router.use('/menu', menuRoutes);
// router.use('/profile', profileRoutes); 
// module.exports = router;


// backend/src/routes/user/index.js
const express = require('express');
const router = express.Router();

// Import route files
const authRoutes = require('./auth');
const menuRoutes = require('./menu');
const profileRoutes = require('./profile');
const cartRoutes = require('./cart');
const orderRoutes = require('./order');
const notificationRoutes = require('./notificationRoutes');
const paymentRoutes = require('./paymentRoutes');
const webhookRoutes = require('./webhookRoutes');

// Use routes
router.use('/auth', authRoutes);
router.use('/menu', menuRoutes);
router.use('/profile', profileRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/notifications', notificationRoutes);
router.use('/payment', paymentRoutes);
router.use('/webhook', webhookRoutes);

module.exports = router;