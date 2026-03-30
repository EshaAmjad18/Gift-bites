//src/routes/staff/paymentRoutes.js
const express = require('express');
const router = express.Router();
const { createPaymentIntent } = require('../../controllers/staff/paymentController');
const { protectStaff } = require('../../middleware/authMiddleware');

router.post('/create-intent', protectStaff, createPaymentIntent);

module.exports = router;
