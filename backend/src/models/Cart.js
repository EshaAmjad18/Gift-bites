// backend/src/models/Cart.js (SIMPLIFIED VERSION)
const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  menuItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuItem',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  price: {
    type: Number,
    required: true
  },
  itemName: {
    type: String,
    required: true
  },
  image: String
}, { _id: true });

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  cafeteria: {
    type: String,
    enum: ['Basement Cafe', 'Quetta Cafe', 'Food Truck'],
    required: true,
    default: 'Basement Cafe'
  },
  items: [cartItemSchema],
  total: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// REMOVE THE PRE-SAVE HOOK TEMPORARILY to fix the "next is not a function" error
// We'll handle total calculation in the controller instead

module.exports = mongoose.model('Cart', cartSchema);