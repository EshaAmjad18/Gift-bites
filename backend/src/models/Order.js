//src/models/Order.js
const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    // User Information
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Order Information
    orderNumber: {
      type: String,
      unique: true,
      required: true,
    },
    cafeteria: {
      type: String,
      required: true,
      enum: ["Basement Cafe", "Quetta Cafe", "Food Truck"],
    },

    // Items Ordered
    items: [
      {
        menuItem: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "MenuItem",
        },
        name: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          required: true,
        },
        image: String,
      },
    ],

    // Payment Information (FRS Requirement)
    totalAmount: {
      type: Number,
      required: true,
    },
    advancePayment: {
      type: Number,
      default: 0,
    },
    remainingPayment: {
      type: Number,
      default: 0,
    },
    paymentOption: {
      type: String,
      enum: ["50", "100"], // 50% or 100% (FRS Requirement)
      default: "50",
    },

    // Stripe Payment Integration (FRS Requirement)
    stripePaymentId: String,
    stripeRefundId: String,

    // backend/src/models/Order.js me paymentStatus enum update karo:

    paymentStatus: {
      type: String,
      enum: [
        "pending", // Payment process not started
        "50_paid", // 50% advance paid (online)
        "100_paid", // 100% full payment (online)
        "cash_50_received", // Remaining 50% cash received at pickup
        "fully_paid", // Final status after cash received
        "refunded", // Refund processed
        "failed", // Payment failed
      ],
      default: "pending",
    },

    // Order Status (FRS Requirement)
    status: {
      type: String,
      enum: [
        "pending_payment", // User created order, payment pending
        "pending_staff", // Payment done, waiting for staff acceptance
        "accepted", // Staff accepted order
        "preparing", // Food being prepared
        "ready", // Order ready for pickup
        "picked", // User picked up order (FRS: within 2 hours)
        "not_picked", // User didn't pick up within 2 hours (FRS Requirement)
        "cancelled", // Order cancelled (within 10 min - FRS Requirement)
        "rejected", // Staff rejected order
      ],
      default: "pending_payment",
    },

    // Timing Information (FRS Requirement)
    createdAt: {
      type: Date,
      default: Date.now,
    },
    acceptedAt: Date,
    preparingAt: Date,
    readyAt: Date,
    pickedAt: Date,
    cancelledAt: Date,
    cancelledBy: {
      type: String,
      enum: ["user", "staff", "system"],
    },
    cancellationReason: String,

    // 10-minute Cancellation Window (FRS Requirement)
    canCancelUntil: {
      type: Date,
      default: function () {
        return new Date(Date.now() + 10 * 60000); // 10 minutes from creation
      },
    },

    // 2-hour Pickup Deadline (FRS Requirement)
    readyAt: Date,
    pickupDeadline: {
      type: Date,
      default: function () {
        if (this.readyAt) {
          return new Date(this.readyAt.getTime() + 2 * 60 * 60000); // 2 hours after ready
        }
        return null;
      },
    },

    // Fine System (FRS Requirement)
    pendingFines: {
      type: Number,
      default: 0,
    },
    totalFines: {
      type: Number,
      default: 0,
    },
    fineApplied: {
      type: Boolean,
      default: false,
    },
    fineAmount: {
      type: Number,
      default: 0,
    },
    finePaid: {
      type: Boolean,
      default: false,
    },
    fineReason: String,

    // Warning System (FRS Requirement)
    warnings: [
      {
        type: String,
        enum: ["late_pickup", "no_show", "cancellation"],
      },
    ],
    warningCount: {
      type: Number,
      default: 0,
    },
    lastWarningAt: {
      type: Date,
    },

    // Strike System (FRS Requirement)
    strikes: {
      type: Number,
      default: 0,
      max: 3,
    },
    lastStrikeAt: Date,
    strikeReasons: [String],

    // Block System
    isBlocked: {
      type: Boolean,
      default: false,
    },
    blockReason: String,
    blockedAt: Date,

    // Refund Information (FRS Requirement)
    refundRequested: {
      type: Boolean,
      default: false,
    },
    refundProcessed: {
      type: Boolean,
      default: false,
    },
    refundAmount: {
      type: Number,
      default: 0,
    },
    refundMethod: {
      type: String,
      enum: ["stripe", "cash", "none"],
      default: "none",
    },

    refundProcessedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
    },

    // refundStatus: {
    //   type: String,
    //   enum: ['pending', '50_paid', '100_paid', 'cash_paid', 'fine_pending', 'refunded'],
    //   default: 'pending'
    // },
    // refundedAt: Date,

    refundStatus: {
      type: String,
      enum: ["none", "pending", "processing", "completed", "failed"],
      default: "none",
    },
    refundedAt: Date,
    refundProcessedAt: Date,

    // Cash Refund Specific
    cashRefundIssued: {
      type: Boolean,
      default: false,
    },

    cashRefundReceivedByUser: {
      type: Boolean,
      default: false,
    },

    cashRefundReceiptNumber: String,

    // For staff refund page

    paidAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Additional Information
    notes: String,
    estimatedPickupTime: Date,
  },
  {
    timestamps: true,
  },
);

// ✅ FIXED: Async middleware (no next parameter needed)
orderSchema.pre("save", async function () {
  // Only for new documents
  if (this.isNew && !this.orderNumber) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const random = Math.floor(1000 + Math.random() * 9000);
    this.orderNumber = `ORD-${year}${month}${day}-${random}`;

    // Set pickup deadline when order is marked ready
    if (this.status === "ready" && !this.pickupDeadline) {
      this.pickupDeadline = new Date(Date.now() + 2 * 60 * 60000); // 2 hours
    }
  }
});

// ✅ FIXED: Check if order can be cancelled (within 10 minutes)
orderSchema.methods.canCancel = function () {
  const now = new Date();

  console.log("DEBUG canCancel:", {
    orderId: this._id,
    status: this.status,
    canCancelUntil: this.canCancelUntil,
    now: now,
  });

  // Safe check for undefined values
  if (!this.status || !this.canCancelUntil) {
    console.log("Missing required fields");
    return false;
  }

  const validStatuses = ["pending_payment", "pending_staff", "accepted"];
  const withinTime = now <= new Date(this.canCancelUntil);

  console.log("Validation:", {
    validStatus: validStatuses.includes(this.status),
    withinTime: withinTime,
    timeLeft: this.canCancelUntil
      ? Math.floor((new Date(this.canCancelUntil) - now) / 60000)
      : 0,
  });

  return withinTime && validStatuses.includes(this.status);
};

// ✅ Helper method to get cancellation time left
orderSchema.methods.getCancellationTimeLeft = function () {
  if (!this.canCancelUntil) return 0;

  const now = new Date();
  const cancelUntil = new Date(this.canCancelUntil);
  const timeLeftMs = cancelUntil - now;

  return Math.max(0, Math.floor(timeLeftMs / 60000)); // minutes
};

// ✅ FIXED: Check if pickup deadline passed
orderSchema.methods.isPickupDeadlinePassed = function () {
  if (!this.pickupDeadline || this.status !== "ready") {
    return false;
  }
  const now = new Date();
  return now > this.pickupDeadline;
};

// Apply fine (10% of total amount) - FRS Requirement
orderSchema.methods.applyFine = function () {
  if (
    this.status === "ready" &&
    this.isPickupDeadlinePassed() &&
    !this.fineApplied
  ) {
    this.fineApplied = true;
    this.fineAmount = Math.round(this.totalAmount * 0.1); // 10% fine
    this.fineReason = "Not picked up within 2 hours";
    this.status = "not_picked";
    return this.fineAmount;
  }
  return 0;
};

// Add strike to user - FRS Requirement
orderSchema.methods.addStrike = function (reason) {
  if (!this.strikes) this.strikes = 0;
  if (!this.strikeReasons) this.strikeReasons = [];

  if (this.strikes < 3) {
    this.strikes += 1;
    this.lastStrikeAt = new Date();
    this.strikeReasons.push(reason || "Unknown reason");
    return this.strikes;
  }
  return this.strikes;
};

module.exports = mongoose.model("Order", orderSchema);
