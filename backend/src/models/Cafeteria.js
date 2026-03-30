//sc/models/Cafeteria.js
const mongoose = require('mongoose');

const cafeteriaSchema = new mongoose.Schema({
  name: { type: String, required: true },
  isActive: { type: Boolean, default: true }
});

module.exports = mongoose.model('Cafeteria', cafeteriaSchema);
