

// backend/src/models/User.js (Updated)
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  studentId: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String
  },
  role: {
    type: String,
    default: 'user',
    enum: ['user']
  },
  
  // Account Status
  isBlocked: {
    type: Boolean,
    default: false
  },
  blockReason: {
    type: String
  },
  blockedAt: {
    type: Date
  },
  
  // Violations & Fines (FRS Requirement)
  violations: {
    type: Number,
    default: 0
  },
  totalFines: {
    type: Number,
    default: 0
  },
  pendingFines: {
    type: Number,
    default: 0
  },
  fines: [{
    amount: Number,
    reason: String,
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    },
    appliedAt: {
      type: Date,
      default: Date.now
    },
    paid: {
      type: Boolean,
      default: false
    },
    paidAt: Date
  }],
  
  // Strikes System (FRS Requirement)
  strikes: {
    type: Number,
    default: 0,
    max: 3
  },
  strikeHistory: [{
    reason: String,
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    },
    date: {
      type: Date,
      default: Date.now
    }
  }],
  
  // User Preferences
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuItem'
  }],
  profileImage: String,
  
  // Activity Tracking
  lastLogin: {
    type: Date
  },
  lastOrder: {
    type: Date
  },
  
  // Statistics
  totalOrders: {
    type: Number,
    default: 0
  },
  completedOrders: {
    type: Number,
    default: 0
  },
  cancelledOrders: {
    type: Number,
    default: 0
  },
  totalSpent: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Apply fine to user
userSchema.methods.applyFine = function(amount, reason, orderId) {
  this.pendingFines += amount;
  this.totalFines += amount;
  this.violations += 1;
  
  this.fines.push({
    amount,
    reason,
    orderId,
    appliedAt: new Date()
  });
  
  return this.save();
};

// Add strike to user (FRS: 3 strikes system)
userSchema.methods.addStrike = function(reason, orderId) {
  if (this.strikes < 3) {
    this.strikes += 1;
    this.violations += 1;
    
    this.strikeHistory.push({
      reason,
      orderId,
      date: new Date()
    });
    
    // Check if user should be blocked (3 strikes)
    if (this.strikes >= 3) {
      this.isBlocked = true;
      this.blockReason = 'Account blocked due to 3 strikes';
      this.blockedAt = new Date();
    }
    
    return this.save();
  }
  return this;
};

// Pay fine
userSchema.methods.payFine = function(amount) {
  if (amount <= this.pendingFines) {
    this.pendingFines -= amount;
    
    // Mark fine as paid
    this.fines.forEach(fine => {
      if (!fine.paid && fine.amount <= amount) {
        fine.paid = true;
        fine.paidAt = new Date();
        amount -= fine.amount;
      }
    });
    
    return this.save();
  }
  return this;
};

module.exports = mongoose.model('User', userSchema);