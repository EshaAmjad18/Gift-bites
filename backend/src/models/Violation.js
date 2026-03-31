// const mongoose = require('mongoose');

// const violationSchema = new mongoose.Schema({
//   user: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },
//   order: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Order'
//   },
//   type: {
//     type: String,
//     enum: ['order_not_picked', 'repeated_violation'],
//     required: true
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now
//   }
// });

// module.exports = mongoose.model('Violation', violationSchema);