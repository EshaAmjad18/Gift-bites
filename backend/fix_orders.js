// backend/fix_orders.js
const mongoose = require('mongoose');
const Order = require('./src/models/Order');

async function fixAllOrders() {
  await mongoose.connect(process.env.MONGO_URI);
  
  const result = await Order.updateMany(
    { paymentStatus: 'pending', paymentOption: { $in: ['50', '100'] } },
    [
      {
        $set: {
          paymentStatus: {
            $cond: {
              if: { $eq: ['$paymentOption', '100'] },
              then: '100_paid',
              else: '50_paid'
            }
          },
          status: 'pending_staff',
          advancePayment: {
            $cond: {
              if: { $eq: ['$paymentOption', '100'] },
              then: '$totalAmount',
              else: { $multiply: ['$totalAmount', 0.5] }
            }
          },
          remainingPayment: {
            $cond: {
              if: { $eq: ['$paymentOption', '100'] },
              then: 0,
              else: { $multiply: ['$totalAmount', 0.5] }
            }
          }
        }
      }
    ]
  );
  
  console.log(` Fixed ${result.modifiedCount} orders`);
  process.exit();
}

fixAllOrders();