// backend/src/routes/admin/dashboard.js - CREATE/UPDATE
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../../middleware/authMiddleware');
const roleCheck = require('../../middleware/roleCheck');
const { 
  getAllStaffsDashboard,
  getAdminDashboard 
} = require('../../controllers/admin/dashboardController');

router.get('/all-staffs', authMiddleware, roleCheck('admin'), getAllStaffsDashboard);
router.get('/', authMiddleware, roleCheck('admin'), getAdminDashboard);

module.exports = router;