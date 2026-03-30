// backend/src/controllers/user/menuController.js (FIXED - SINGLE COPY)
const MenuItem = require('../../models/MenuItem');
const Cafeteria = require('../../models/Cafeteria');

/**
 * Get today's menu for a specific cafeteria (for users)
 */
exports.getTodayMenuForUser = async (req, res) => {
  try {
    const { cafeteriaName } = req.params;
    
    console.log('Fetching today\'s menu for:', cafeteriaName);
    
    // Validate cafeteria exists
    const cafeteria = await Cafeteria.findOne({ 
      name: cafeteriaName,
      isActive: true 
    });
    
    if (!cafeteria) {
      return res.status(404).json({ 
        success: false, 
        message: 'Cafeteria not found or inactive' 
      });
    }
    
    // Get today's menu items
    const items = await MenuItem.find({ 
      cafeteria: cafeteriaName,
      availableToday: true,
      available: true
    }).sort({ 
      isHotItem: -1,  // Hot items first
      category: 1,
      name: 1 
    });
    
    console.log(`Found ${items.length} items for ${cafeteriaName}`);
    
    // Separate hot items and regular items
    const hotItems = items.filter(item => item.isHotItem);
    const regularItems = items.filter(item => !item.isHotItem);
    
    // Group by category
    const groupedByCategory = regularItems.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {});
    
    res.json({
      success: true,
      cafeteria: {
        name: cafeteria.name,
        isActive: cafeteria.isActive
      },
      menu: {
        hotItems,
        itemsByCategory: groupedByCategory,
        allItems: items
      },
      count: items.length
    });
  } catch (error) {
    console.error('Get today menu for user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch menu',
      error: error.message 
    });
  }
};

/**
 * Get all cafeterias (for user selection)
 */
exports.getAllCafeterias = async (req, res) => {
  try {
    const cafeterias = await Cafeteria.find({ 
      isActive: true 
    }).select('name _id description emoji timings isActive');
    
    res.json({
      success: true,
      cafeterias
    });
  } catch (error) {
    console.error('Get cafeterias error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch cafeterias' 
    });
  }
};

/**
 * Check cafeteria operating hours
 */
exports.checkCafeteriaHours = async (req, res) => {
  try {
    const { cafeteriaName } = req.params;
    const now = new Date();
    const hour = now.getHours();
    
    // Default hours
    const operatingHours = {
      open: 8,   // 8 AM
      close: 22  // 10 PM
    };
    
    const isOpen = hour >= operatingHours.open && hour < operatingHours.close;
    
    res.json({
      success: true,
      isOpen,
      hours: operatingHours,
      currentTime: now.toLocaleTimeString(),
      message: isOpen 
        ? `Cafeteria is open (${operatingHours.open}:00 - ${operatingHours.close}:00)`
        : `Cafeteria is closed. Opens at ${operatingHours.open}:00`
    });
  } catch (error) {
    console.error('Check hours error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to check hours' 
    });
  }
};