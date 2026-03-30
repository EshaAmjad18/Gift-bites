// backend/models/Refund.js
const mongoose = require('mongoose');

const refundSchema = new mongoose.Schema({
  // Order reference
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  
  // User reference
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Staff who processed the refund
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff'
  },
  
  // Amount to refund
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Refund method
  method: {
    type: String,
    enum: ['stripe', 'cash'],
    required: true
  },
  
  // Refund status
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  
  // Type of refund
  type: {
    type: String,
    enum: ['order_cancellation', 'order_rejection', 'fine_refund', 'other'],
    default: 'order_cancellation'
  },
  
  // Stripe specific fields (if applicable)
  stripeRefundId: String,
  stripePaymentIntentId: String,
  stripeChargeId: String,
  
  // Cash refund details
  cashReceivedByUser: {
    type: Boolean,
    default: false
  },
  cashReceiptNumber: String,
  
  // Additional notes
  notes: String,
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  processedAt: Date,
  completedAt: Date
}, {
  timestamps: true
});

// Indexes for faster queries
refundSchema.index({ order: 1 });
refundSchema.index({ user: 1 });
refundSchema.index({ status: 1 });
refundSchema.index({ createdAt: -1 });
refundSchema.index({ processedBy: 1 });

// Virtual field for formatted amount
refundSchema.virtual('formattedAmount').get(function() {
  return `PKR ${this.amount.toFixed(2)}`;
});

// Method to check if refund is pending
refundSchema.methods.isPending = function() {
  return this.status === 'pending';
};

// Method to check if refund is completed
refundSchema.methods.isCompleted = function() {
  return this.status === 'completed';
};

// Pre-save middleware
refundSchema.pre('save', function(next) {
  if (this.status === 'completed' && !this.completedAt) {
    this.completedAt = new Date();
  }
  
  if (this.method === 'cash' && this.status === 'completed') {
    this.cashReceivedByUser = true;
  }
  
  next();
});

const Refund = mongoose.model('Refund', refundSchema);

module.exports = Refund;