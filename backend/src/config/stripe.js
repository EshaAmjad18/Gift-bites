
const Stripe = require('stripe');

// Force minimum amount for US account (Rs. 150 minimum)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

//Custom wrapper to enforce minimum Rs. 150
const originalCreate = stripe.checkout.sessions.create;

stripe.checkout.sessions.create = async function(params) {
  // Check if amount is too small
  if (params.line_items && params.line_items[0] && params.line_items[0].price_data) {
    const unitAmount = params.line_items[0].price_data.unit_amount;
    const MINIMUM_PAISE = 15000; // Rs. 150 = 15000 paise
    
    if (unitAmount < MINIMUM_PAISE) {
      console.log(`⚠️ Stripe minimum fix: Adjusting from Rs. ${unitAmount/100} to Rs. ${MINIMUM_PAISE/100}`);
      
      // Store original amount in metadata
      if (!params.metadata) params.metadata = {};
      params.metadata.originalAmount = (unitAmount / 100).toString();
      params.metadata.minimumApplied = 'true';
      
      // Force minimum amount
      params.line_items[0].price_data.unit_amount = MINIMUM_PAISE;
      
      // Update description
      const originalDesc = params.line_items[0].price_data.product_data.description || '';
      params.line_items[0].price_data.product_data.description = 
        `${originalDesc} (Minimum charge Rs. 150)`;
    }
  }
  
  return originalCreate.call(this, params);
};

module.exports = stripe;