//src/controlleers/staff/paymentController.js
const stripe = require('../../config/stripe');
const Order = require('../../models/Order');

exports.createPaymentIntent = async (req, res) => {
  try {
    const { amount, paymentPercent, orderId } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // rupees → paisa
      currency: 'pkr',
      metadata: {
        orderId,
        paymentPercent
      }
    });

    // update order payment %
    await Order.findByIdAndUpdate(orderId, {
      paymentPercent
    });

    res.json({
      clientSecret: paymentIntent.client_secret
    });

  } catch (error) {
    res.status(500).json({ message: 'Payment intent failed' });
  }
};
