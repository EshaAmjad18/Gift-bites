
/**
 * Middleware: Cafeteria Closed Window (TEMP FOR TESTING)
 * Closed ONLY from 5:00 AM to 6:00 AM
 * Staff cannot update menu during this time
 */

const cafeteriaHours = (req, res, next) => {
  const now = new Date();
  const hour = now.getHours(); // 0 - 23

  // ❌ Closed window: 5 AM - 6 AM
  if (hour >= 7 && hour < 20) {
    return res.status(403).json({
      success: false,
      message: 'Cafeteria temporarily closed for maintenance (5:00 AM - 6:00 AM)'
    });
  }

  // ✅ Allowed all other times
  next();
};

module.exports = cafeteriaHours;

