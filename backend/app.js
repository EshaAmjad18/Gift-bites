// backend/app.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");

const app = express();

// ========== CORS SETUP FIRST ==========
app.use(
  cors({
    origin: [
      "http://localhost:5173", 
      "http://localhost:3000",
      "https://gift-bites.vercel.app",     // ✅ Vercel frontend
      "https://gift-bites.vercel.app", 
      "https://gift-bites-git-main.vercel.app" 
    ],
    credentials: true,
  })
);

// ========== WEBHOOK SETUP - MUST BE BEFORE JSON PARSER ==========
// ✅ FIXED: Import paymentController directly
const paymentController = require("./src/controllers/user/paymentController");

// ✅ FIXED: Use paymentController.handleWebhook (NOT orderController.stripeWebhook)
app.post(
  "/api/webhook/stripe",
  express.raw({ type: "application/json" }), // ✅ RAW body for Stripe
  paymentController.handleWebhook, // ✅ CORRECT FUNCTION
);

// ✅ ALSO ADD DEBUG WEBHOOK ENDPOINT
app.post(
  "/api/webhook/debug",
  express.raw({ type: "application/json" }),
  paymentController.debugWebhook,
);

// ✅ TEST ENDPOINT
app.get("/api/webhook/test", (req, res) => {
  res.json({
    success: true,
    message: "Webhook endpoint is working",
    endpoint: "/api/webhook/stripe",
    timestamp: new Date().toISOString(),
    note: "Stripe will send POST requests to this endpoint",
  });
});

// ========== REGULAR MIDDLEWARE ==========
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const StrikeManager = require("./src/utils/autoStrikeManager");


// ========== MONGODB CONNECTION ==========
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));
// Initialize Strike Manager
try {
  StrikeManager.init();
  console.log("✅ Strike Manager initialized");
} catch (error) {
  console.error("❌ Error initializing Strike Manager:", error);
}

// ========== IMPORT ROUTES ==========

// User Routes
const userAuthRoutes = require("./src/routes/user/auth");
const menuController = require("./src/controllers/user/menuController");
const userCartRoutes = require("./src/routes/user/cart");
const userOrderRoutes = require("./src/routes/user/order");
const userPaymentRoutes = require("./src/routes/user/paymentRoutes");
const userNotificationRoutes = require("./src/routes/user/notificationRoutes"); // NEW

// Staff Routes
const staffAuthRoutes = require("./src/routes/staff/auth");
const staffMenuRoutes = require("./src/routes/staff/menu");
const staffOrderRoutes = require("./src/routes/staff/order");
const staffPaymentRoutes = require("./src/routes/staff/paymentRoutes");
const staffProfileRoutes = require("./src/routes/staff/profile");
const staffRefundRoutes = require("./src/routes/staff/refund");
const staffDashboardRoutes = require("./src/routes/staff/dashboard");

// Admin Routes
const adminAuthRoutes = require("./src/routes/admin/auth");
const adminDashboardRoutes = require("./src/routes/admin/dashboard");
const performanceRoutes = require("./src/routes/admin/performance");
const adminUserRoutes = require("./src/routes/admin/users");

// ========== USE ROUTES ==========
// User Routes
app.use("/api/user/auth", userAuthRoutes);
app.get("/api/user/menu/cafeterias", menuController.getAllCafeterias);
app.get(
  "/api/user/menu/:cafeteriaName/today",
  menuController.getTodayMenuForUser,
);
app.get(
  "/api/user/menu/:cafeteriaName/hours",
  menuController.checkCafeteriaHours,
);
app.use("/api/user/cart", userCartRoutes);
app.use("/api/user/orders", userOrderRoutes);
app.use("/api/user/payment", userPaymentRoutes);
app.use("/api/user/notifications", userNotificationRoutes); // NEW

// Staff Routes
app.use("/api/staff/auth", staffAuthRoutes);
app.use("/api/staff/menu", staffMenuRoutes);
app.use("/api/staff/orders", staffOrderRoutes);
app.use("/api/staff/payment", staffPaymentRoutes);
app.use("/api/staff/profile", staffProfileRoutes);
app.use("/api/staff/refunds", staffRefundRoutes);
app.use("/api/staff/dashboard", staffDashboardRoutes);

// Admin Routes
app.use("/api/admin/auth", adminAuthRoutes);
app.use("/api/admin/dashboard", adminDashboardRoutes);
app.use("/api/admin/performance", performanceRoutes);
app.use("/api/admin/users", adminUserRoutes);

// ========== UPLOADS DIRECTORY SETUP ==========
const backendRoot = __dirname;
const uploadsDir = path.join(backendRoot, "uploads");

console.log("🔍 Debug Info:");
console.log("Backend root:", backendRoot);
console.log("Uploads directory:", uploadsDir);

// Ensure uploads folder exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log("✅ Created uploads directory at:", uploadsDir);
}

// Check files in uploads
if (fs.existsSync(uploadsDir)) {
  const files = fs.readdirSync(uploadsDir);
  console.log(`📁 Files in uploads (${files.length}):`);
  files.slice(0, 5).forEach((file) => {
    const filePath = path.join(uploadsDir, file);
    const exists = fs.existsSync(filePath);
    console.log(`  - ${file} (${exists ? "Exists" : "Missing"})`);
  });
  if (files.length > 5) console.log(`  ... and ${files.length - 5} more`);
}

// Serve static files
app.use(
  "/uploads",
  express.static(uploadsDir, {
    setHeaders: (res, filePath) => {
      res.set("Access-Control-Allow-Origin", "*");
    },
  }),
);

console.log("🌐 Serving static files from:", uploadsDir);

// ========== TEST ROUTES ==========
// Test route for specific image
app.get("/api/test/image/:filename", (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(uploadsDir, filename);

  console.log("🔍 Testing image:", {
    filename: filename,
    filePath: filePath,
    exists: fs.existsSync(filePath),
    uploadsDir: uploadsDir,
  });

  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({
      error: "File not found",
      filename: filename,
      searchPath: filePath,
      filesInUploads: fs.readdirSync(uploadsDir),
    });
  }
});

// Debug all files
app.get("/api/debug/files", (req, res) => {
  const files = fs.readdirSync(uploadsDir);

  const detailedFiles = files.map((file) => {
    const filePath = path.join(uploadsDir, file);
    const stats = fs.statSync(filePath);

    return {
      name: file,
      size: stats.size,
      type: path.extname(file),
      url: `http://localhost:5000/uploads/${file}`,
      testUrl: `http://localhost:5000/api/test/image/${file}`,
      accessible: true,
    };
  });

  res.json({
    uploadsDir: uploadsDir,
    totalFiles: files.length,
    files: detailedFiles,
  });
});

// ========== DEFAULT ROUTE ==========
app.get("/", (req, res) => {
  res.send("🚀 Gift Bites Backend API is running...");
});

// ========== HEALTH CHECK ==========
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    services: {
      database:
        mongoose.connection.readyState === 1 ? "connected" : "disconnected",
      stripe: "configured",
      uploads: fs.existsSync(uploadsDir) ? "available" : "unavailable",
      webhook_endpoint: "http://localhost:5000/api/webhook/stripe",
      payment_routes: "http://localhost:5000/api/user/payment",
    },
  });
});

// ========== SOCKET.IO SETUP ==========
const server = require("http").createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:3000"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("⚡ Client connected:", socket.id);
  socket.on("disconnect", () =>
    console.log("❌ Client disconnected:", socket.id),
  );
});

app.set("io", io);

// ========== ORDER WARNING CHECKER ==========
// Background warning checker → every 5 mins
const checkOrderWarnings = require("./src/utils/orderWarningChecker");
setInterval(() => checkOrderWarnings(io), 5 * 60 * 1000);

// ========== PICKUP DEADLINE CHECKER ==========
const { checkPickupDeadlines } = require("./src/utils/checkPickupDeadlines");
setInterval(
  () => {
    checkPickupDeadlines().catch((err) =>
      console.error("Error in pickup deadline check:", err),
    );
  },
  5 * 60 * 1000,
);

// ========== SEED CAFETERIAS ==========
const seedCafes = require("./src/utils/seedCafes");
seedCafes();

// ========== START SERVER ==========
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔗 Stripe webhook: http://localhost:${PORT}/api/webhook/stripe`);
  console.log(`🔗 Webhook test: http://localhost:${PORT}/api/webhook/test`);
  console.log(`🔗 Payment routes: http://localhost:${PORT}/api/user/payment`);
});
