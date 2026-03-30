// backend/models/Staff.js
const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  cafeteria: {
    type: String,
    required: true,
    enum: ['Basement Cafe', 'Quetta Cafe', 'Food Truck'] // Update based on your cafeterias
  },
  role: {
    type: String,
    default: 'staff',
    enum: ['staff']
  },
  isBlocked: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Staff', staffSchema);