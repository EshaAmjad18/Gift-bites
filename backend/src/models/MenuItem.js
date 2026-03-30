

// backend/src/models/MenuItem.js
const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  description: { type: String, default: '' },
  image: { type: String },
  isHotItem: { type: Boolean, default: false },
  available: { type: Boolean, default: true },
  availableToday: { type: Boolean, default: false },
  cafeteria: { type: String, required: true, enum: ['Basement Cafe', 'Quetta Cafe', 'Food Truck'] },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  preparationTime: { type: Number, default: 15 }
}, { timestamps: true });

module.exports = mongoose.model('MenuItem', menuItemSchema);
