// backend/src/routes/user/webhookRoutes.js
const express = require("express");
const router = express.Router();
const paymentController = require("../../controllers/user/paymentController");

const webhookRouter = express.Router();

webhookRouter.post(
  "/",
  express.raw({ type: "application/json" }),
  paymentController.handleWebhook,
);
webhookRouter.post(
  "/debug",
  express.raw({ type: "application/json" }),
  paymentController.debugWebhook,
);

webhookRouter.get("/test", (req, res) => {
  console.log("✅ Webhook test endpoint called");
  res.json({
    success: true,
    message: "Stripe webhook endpoint is working",
    endpoint: "/api/user/webhook",
    timestamp: new Date().toISOString(),
  });
});

webhookRouter.post("/simulate", (req, res) => {
  console.log("🔧 Simulating webhook event");

  // Simulate a successful payment
  const mockEvent = {
    type: "checkout.session.completed",
    data: {
      object: {
        id: "cs_test_mock_" + Date.now(),
        payment_intent: "pi_mock_" + Date.now(),
        payment_status: "paid",
        amount_total: 40500,
        currency: "pkr",
        metadata: {
          orderId: req.body.orderId || "6988f36415ec26d099b0d1c1",
          userId: req.body.userId || "6984d109b75871b6c54a9f5c",
          paymentOption: req.body.paymentOption || "50",
          orderNumber: req.body.orderNumber || "ORD-260209-XXXX",
        },
      },
    },
  };

  console.log("Mock event created:", mockEvent.data.object.id);

  res.json({
    success: true,
    message: "Webhook simulation initiated",
    mockEvent: mockEvent,
    note: "This is a simulation. Actual webhook will be called by Stripe.",
  });
});

module.exports = webhookRouter;
