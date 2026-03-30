// backend/routes/admin/performance.js
const express = require('express');
const router = express.Router();
const { getPerformanceData } = require('../../controllers/admin/performanceController');
const { authMiddleware } = require('../../middleware/authMiddleware');
const roleCheck = require('../../middleware/roleCheck');

router.use(authMiddleware);
router.use(roleCheck('admin'));

router.get('/', getPerformanceData);

module.exports = router;