// backend/src/routes/staff/refund.js - UPDATED
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../../middleware/authMiddleware');
const roleCheck = require('../../middleware/roleCheck');
const refundController = require('../../controllers/staff/refund');
console.log('Refund controller exports:', Object.keys(refundController));

router.get('/pending', authMiddleware, roleCheck('staff'), refundController.getPendingCashRefunds);
router.post('/:orderId/complete', authMiddleware, roleCheck('staff'), refundController.markCashRefundComplete);
router.get('/stats', authMiddleware, roleCheck('staff'), refundController.getRefundStats);

module.exports = router;