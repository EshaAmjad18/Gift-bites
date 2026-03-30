
// backend/src/models/DailyMenu.js
const mongoose = require('mongoose');

const dailyMenuSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  cafeteria: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cafeteria',
    required: true
  },
  items: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuItem'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('DailyMenu', dailyMenuSchema);
