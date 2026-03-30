const express = require('express');
const router = express.Router();
const { protectStaff } = require('../../middleware/authMiddleware');
const { getReports } = require('../../controllers/staff/reportController');

// GET all admin reports (Staff view)
router.get('/', protectStaff, getReports);

module.exports = router;
