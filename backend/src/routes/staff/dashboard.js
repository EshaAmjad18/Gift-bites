// backend/src/routes/staff/dashboard.js
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../../middleware/authMiddleware');
const roleCheck = require('../../middleware/roleCheck');
const { getDashboardStats } = require('../../controllers/staff/dashboardController');

router.get('/', authMiddleware, roleCheck('staff'), getDashboardStats);

module.exports = router;