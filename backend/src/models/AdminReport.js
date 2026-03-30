const mongoose = require('mongoose');

const adminReportSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reason: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  resolved: { type: Boolean, default: false } // admin block karne ke baad true
});

module.exports = mongoose.model('AdminReport', adminReportSchema);

