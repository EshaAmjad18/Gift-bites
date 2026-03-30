// backend/src/routes/staff/profile.js (UPDATED WITH BETTER ERROR HANDLING)
const express = require("express");
const router = express.Router();
const Staff = require("../../models/Staff");
const bcrypt = require("bcryptjs");
const { authMiddleware } = require("../../middleware/authMiddleware");
const roleCheck = require("../../middleware/roleCheck");

// Get staff profile
router.get("/", authMiddleware, roleCheck("staff"), async (req, res) => {
  try {
    console.log("🔍 Getting staff profile...");
    console.log("User from middleware:", req.user);
    console.log("User ID:", req.userId);

    // ✅ Multiple ways to get user ID
    const userId = req.userId || req.user?._id || req.staff?._id;

    if (!userId) {
      console.error("❌ No user ID found");
      return res.status(400).json({
        success: false,
        message: "User ID not found in request",
      });
    }

    console.log("🔍 Looking for staff with ID:", userId);

    const staff = await Staff.findById(userId).select("-password");

    if (!staff) {
      console.error("❌ Staff not found in database");
      return res.status(404).json({
        success: false,
        message: "Staff not found",
      });
    }

    console.log("✅ Staff found:", staff.email);

    res.json({
      success: true,
      staff,
      debug: {
        userIdUsed: userId,
        userFromRequest: req.user
          ? {
              id: req.user._id,
              email: req.user.email,
            }
          : null,
      },
    });
  } catch (error) {
    console.error("❌ Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching profile",
      error: error.message,
    });
  }
});

// Update staff profile
router.put("/", authMiddleware, roleCheck("staff"), async (req, res) => {
  try {
    console.log("🔄 Updating staff profile...");
    console.log("Request body:", req.body);
    console.log("Request user:", req.user);
    console.log("Request userId:", req.userId);

    const { name, phone, currentPassword, newPassword } = req.body;

    // ✅ Get user ID from multiple possible sources
    const userId = req.userId || req.user?._id || req.staff?._id;

    if (!userId) {
      console.error("❌ No user ID found in request");
      return res.status(400).json({
        success: false,
        message: "User ID not found",
      });
    }

    console.log("🔍 Finding staff with ID:", userId);

    const staff = await Staff.findById(userId);

    if (!staff) {
      console.error("❌ Staff not found with ID:", userId);
      return res.status(404).json({
        success: false,
        message: "Staff not found",
      });
    }

    console.log("✅ Staff found:", staff.email);

    // Track changes
    const changes = [];
    const errors = [];

    // Update basic info
    if (name && name.trim() && name !== staff.name) {
      if (name.length < 2) {
        errors.push("Name must be at least 2 characters");
      } else {
        staff.name = name.trim();
        changes.push("name");
      }
    }

    if (phone && phone.trim() && phone !== staff.phone) {
      // Basic phone validation
      if (phone.length < 10) {
        errors.push("Phone number must be at least 10 digits");
      } else {
        staff.phone = phone.trim();
        changes.push("phone");
      }
    }

    // Update password if provided
    if (currentPassword || newPassword) {
      if (!currentPassword) {
        errors.push("Current password is required to change password");
      } else if (!newPassword) {
        errors.push("New password is required");
      } else {
        console.log("🔐 Validating password change...");

        // Check current password
        const isMatch = await bcrypt.compare(currentPassword, staff.password);
        if (!isMatch) {
          errors.push("Current password is incorrect");
        }

        // Validate new password
        if (newPassword.length < 6) {
          errors.push("New password must be at least 6 characters");
        }

        if (currentPassword === newPassword) {
          errors.push("New password must be different from current password");
        }

        // If no errors, update password
        if (errors.length === 0) {
          const salt = await bcrypt.genSalt(10);
          staff.password = await bcrypt.hash(newPassword, salt);
          changes.push("password");
        }
      }
    }

    // Check for errors
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors,
      });
    }

    if (changes.length === 0) {
      console.log("⚠️ No changes to update");
      return res.status(400).json({
        success: false,
        message: "No changes to update",
      });
    }

    await staff.save();
    console.log("✅ Profile updated successfully. Changes:", changes);

    // Remove password from response
    const staffResponse = staff.toObject();
    delete staffResponse.password;

    res.json({
      success: true,
      message: "Profile updated successfully",
      changes: changes,
      staff: staffResponse,
      debug: {
        userIdUsed: userId,
        changesMade: changes,
      },
    });
  } catch (error) {
    console.error("❌ Profile update error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during profile update",
      error: error.message,
    });
  }
});

// Debug route - remove in production
router.get("/debug", authMiddleware, roleCheck("staff"), async (req, res) => {
  try {
    const userId = req.userId || req.user?._id;
    const staff = await Staff.findById(userId).select("-password");

    res.json({
      success: true,
      debugInfo: {
        headers: {
          authorization: req.headers.authorization ? "Present" : "Missing",
        },
        token: req.headers.authorization
          ? req.headers.authorization.substring(0, 20) + "..."
          : null,
        userFromMiddleware: req.user
          ? {
              id: req.user._id,
              email: req.user.email,
              role: req.user.role,
            }
          : null,
        userIdFromMiddleware: req.userId,
        staffFromDatabase: staff
          ? {
              id: staff._id,
              email: staff.email,
              name: staff.name,
            }
          : "Not found",
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
