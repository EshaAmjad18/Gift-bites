// backend/src/controllers/staff/menuController.js
const MenuItem = require('../../models/MenuItem');

exports.getMenuItems = async (req, res) => {
  try {
    console.log('Getting menu items for cafeteria:', req.user.cafeteria);
    
    const items = await MenuItem.find({ 
      cafeteria: req.user.cafeteria 
    }).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      items,
      count: items.length
    });
  } catch (error) {
    console.error('Get menu items error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch menu items',
      error: error.message
    });
  }
};

/**
 * Add new menu item (with image)
 */
exports.addMenuItem = async (req, res) => {
  try {
    console.log('=== ADD MENU ITEM REQUEST ===');
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    console.log('User info:', req.user);
    
    // Validate required fields
    if (!req.body.name || !req.body.category || !req.body.price) {
      return res.status(400).json({
        success: false,
        message: 'Name, category, and price are required fields'
      });
    }
    
    // Parse data
    const isHotItem = req.body.isHotItem === 'true' || req.body.isHotItem === true;
    const price = parseFloat(req.body.price);
    
    if (isNaN(price) || price <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid price is required'
      });
    }
    
    // Create item data
    const itemData = {
      name: req.body.name.trim(),
      category: req.body.category.trim(),
      price: price,
      isHotItem: isHotItem,
      cafeteria: req.user.cafeteria, // Staff's cafeteria
      image: req.file ? req.file.filename : null,
      available: true,
      availableToday: false, // Default: not in today's menu
      createdBy: req.user._id
    };
    
    console.log('Creating item with data:', itemData);
    
    // Create menu item
    const item = await MenuItem.create(itemData);
    
    console.log('✅ Item created successfully:', item._id);
    
    res.status(201).json({
      success: true,
      message: 'Item added successfully',
      item: {
        _id: item._id,
        name: item.name,
        category: item.category,
        price: item.price,
        isHotItem: item.isHotItem,
        available: item.available,
        availableToday: item.availableToday,
        image: item.image,
        cafeteria: item.cafeteria,
        createdAt: item.createdAt
      }
    });
  } catch (error) {
    console.error('❌ Add menu item error:', error);
    
    // Handle duplicate name error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Menu item with this name already exists in your cafeteria'
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Failed to add menu item',
      error: error.message 
    });
  }
};

/**
 * Get item by ID
 */
exports.getMenuItemById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const item = await MenuItem.findById(id);
    
    if (!item) {
      return res.status(404).json({ 
        success: false, 
        message: 'Menu item not found' 
      });
    }
    
    // Check if item belongs to staff's cafeteria
    if (item.cafeteria !== req.user.cafeteria) {
      return res.status(403).json({ 
        success: false, 
        message: 'Unauthorized access to this item' 
      });
    }
    
    res.json({
      success: true,
      item
    });
  } catch (error) {
    console.error('Get menu item by ID error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch menu item',
      error: error.message 
    });
  }
};

/**
 * Update menu item
 */
exports.updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('=== UPDATE MENU ITEM ===');
    console.log('Item ID:', id);
    console.log('Update data:', req.body);
    console.log('File:', req.file);
    
    // Find the item
    const item = await MenuItem.findById(id);
    
    if (!item) {
      return res.status(404).json({ 
        success: false, 
        message: 'Menu item not found' 
      });
    }
    
    // Check if item belongs to staff's cafeteria
    if (item.cafeteria !== req.user.cafeteria) {
      return res.status(403).json({ 
        success: false, 
        message: 'Unauthorized access to this item' 
      });
    }
    
    // Prepare update data
    const updateData = {};
    
    if (req.body.name !== undefined) updateData.name = req.body.name.trim();
    if (req.body.category !== undefined) updateData.category = req.body.category.trim();
    
    if (req.body.price !== undefined) {
      const price = parseFloat(req.body.price);
      if (isNaN(price) || price <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Valid price is required'
        });
      }
      updateData.price = price;
    }
    
    if (req.body.isHotItem !== undefined) {
      updateData.isHotItem = req.body.isHotItem === 'true' || req.body.isHotItem === true;
    }
    
    if (req.body.available !== undefined) {
      updateData.available = req.body.available === 'true' || req.body.available === true;
    }
    
    if (req.body.availableToday !== undefined) {
      updateData.availableToday = req.body.availableToday === 'true' || req.body.availableToday === true;
    }
    
    if (req.body.description !== undefined) updateData.description = req.body.description;
    
    // Handle image update
    if (req.file) {
      updateData.image = req.file.filename;
    } else if (req.body.removeImage === 'true') {
      updateData.image = null;
    }
    
    console.log('Updating with data:', updateData);
    
    // Update the item
    const updatedItem = await MenuItem.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, runValidators: true }
    );
    
    res.json({
      success: true,
      message: 'Item updated successfully',
      item: updatedItem
    });
  } catch (error) {
    console.error('Update menu item error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update menu item',
      error: error.message 
    });
  }
};

/**
 * Delete menu item
 */
exports.deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    
    const item = await MenuItem.findById(id);
    
    if (!item) {
      return res.status(404).json({ 
        success: false, 
        message: 'Menu item not found' 
      });
    }
    
    // Check if item belongs to staff's cafeteria
    if (item.cafeteria !== req.user.cafeteria) {
      return res.status(403).json({ 
        success: false, 
        message: 'Unauthorized access to this item' 
      });
    }
    
    // Delete the item
    await MenuItem.findByIdAndDelete(id);
    
    res.json({
      success: true,
      message: 'Item deleted successfully'
    });
  } catch (error) {
    console.error('Delete menu item error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete menu item',
      error: error.message 
    });
  }
};

/**
 * Toggle availability
 */
exports.toggleAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    
    const item = await MenuItem.findById(id);
    
    if (!item) {
      return res.status(404).json({ 
        success: false, 
        message: 'Item not found' 
      });
    }
    
    // Check if item belongs to staff's cafeteria
    if (item.cafeteria !== req.user.cafeteria) {
      return res.status(403).json({ 
        success: false, 
        message: 'Unauthorized access' 
      });
    }
    
    // Toggle availability
    item.available = !item.available;
    await item.save();
    
    res.json({
      success: true,
      message: `Item ${item.available ? 'made available' : 'made unavailable'}`,
      item
    });
  } catch (error) {
    console.error('Toggle availability error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

/**
 * Add item to today's menu
 */
exports.addToTodayMenu = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('Adding item to today\'s menu:', id);
    
    const item = await MenuItem.findById(id);
    
    if (!item) {
      return res.status(404).json({ 
        success: false, 
        message: 'Item not found' 
      });
    }
    
    // Check if item belongs to staff's cafeteria
    if (item.cafeteria !== req.user.cafeteria) {
      return res.status(403).json({ 
        success: false, 
        message: 'Unauthorized access' 
      });
    }
    
    // Check if item is available
    if (!item.available) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot add unavailable item to today\'s menu' 
      });
    }
    
    // Already in today's menu?
    if (item.availableToday) {
      return res.status(400).json({ 
        success: false, 
        message: 'Item already in today\'s menu' 
      });
    }
    
    // Add to today's menu
    item.availableToday = true;
    await item.save();
    
    console.log('✅ Item added to today\'s menu:', item.name);
    
    res.json({
      success: true,
      message: 'Item added to today\'s menu',
      item: {
        _id: item._id,
        name: item.name,
        category: item.category,
        price: item.price,
        image: item.image,
        isHotItem: item.isHotItem,
        availableToday: item.availableToday
      }
    });
  } catch (error) {
    console.error('Add to today menu error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to add to today\'s menu'
    });
  }
};

/**
 * Remove item from today's menu
 */
exports.removeFromTodayMenu = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('Removing item from today\'s menu:', id);
    
    const item = await MenuItem.findById(id);
    
    if (!item) {
      return res.status(404).json({ 
        success: false, 
        message: 'Item not found' 
      });
    }
    
    // Check if item belongs to staff's cafeteria
    if (item.cafeteria !== req.user.cafeteria) {
      return res.status(403).json({ 
        success: false, 
        message: 'Unauthorized access' 
      });
    }
    
    // Already not in today's menu?
    if (!item.availableToday) {
      return res.status(400).json({ 
        success: false, 
        message: 'Item is not in today\'s menu' 
      });
    }
    
    // Remove from today's menu
    item.availableToday = false;
    await item.save();
    
    console.log('✅ Item removed from today\'s menu:', item.name);
    
    res.json({
      success: true,
      message: 'Item removed from today\'s menu',
      item: {
        _id: item._id,
        name: item.name,
        availableToday: item.availableToday
      }
    });
  } catch (error) {
    console.error('Remove from today menu error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to remove from today\'s menu'
    });
  }
};

/**
 * Get today's menu items
 */
exports.getTodayMenu = async (req, res) => {
  try {
    console.log('Getting today\'s menu for cafeteria:', req.user.cafeteria);
    
    const items = await MenuItem.find({ 
      cafeteria: req.user.cafeteria,
      availableToday: true,
      available: true
    }).sort({ 
      isHotItem: -1, // Hot items first
      category: 1,
      name: 1 
    });
    
    console.log(`Found ${items.length} items for today's menu`);
    
    res.json({
      success: true,
      items,
      count: items.length
    });
  } catch (error) {
    console.error('Get today menu error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to fetch today\'s menu'
    });
  }
};

/**
 * Bulk update today's menu (set multiple items at once)
 */
exports.bulkUpdateTodayMenu = async (req, res) => {
  try {
    const { itemIds } = req.body; // Array of item IDs to set as today's menu
    
    if (!Array.isArray(itemIds)) {
      return res.status(400).json({
        success: false,
        message: 'itemIds must be an array'
      });
    }
    
    // First, set all items in this cafeteria to not available today
    await MenuItem.updateMany(
      { cafeteria: req.user.cafeteria },
      { availableToday: false }
    );
    
    // Then, set only the specified items to available today
    if (itemIds.length > 0) {
      await MenuItem.updateMany(
        { 
          _id: { $in: itemIds },
          cafeteria: req.user.cafeteria,
          available: true
        },
        { availableToday: true }
      );
    }
    
    // Get updated today's menu
    const todayItems = await MenuItem.find({
      cafeteria: req.user.cafeteria,
      availableToday: true,
      available: true
    });
    
    res.json({
      success: true,
      message: `Today's menu updated with ${todayItems.length} items`,
      items: todayItems
    });
  } catch (error) {
    console.error('Bulk update today menu error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to update today\'s menu'
    });
  }
};

/**
 * Get menu statistics
 */
exports.getMenuStats = async (req, res) => {
  try {
    const stats = await MenuItem.aggregate([
      { $match: { cafeteria: req.user.cafeteria } },
      {
        $group: {
          _id: null,
          totalItems: { $sum: 1 },
          availableItems: {
            $sum: { $cond: [{ $eq: ["$available", true] }, 1, 0] }
          },
          todayItems: {
            $sum: { $cond: [{ $eq: ["$availableToday", true] }, 1, 0] }
          },
          hotItems: {
            $sum: { $cond: [{ $eq: ["$isHotItem", true] }, 1, 0] }
          },
          averagePrice: { $avg: "$price" },
          minPrice: { $min: "$price" },
          maxPrice: { $max: "$price" }
        }
      },
      {
        $project: {
          _id: 0,
          totalItems: 1,
          availableItems: 1,
          todayItems: 1,
          hotItems: 1,
          averagePrice: { $round: ["$averagePrice", 2] },
          minPrice: 1,
          maxPrice: 1
        }
      }
    ]);
    
    // Get category distribution
    const categoryStats = await MenuItem.aggregate([
      { $match: { cafeteria: req.user.cafeteria } },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          available: { $sum: { $cond: [{ $eq: ["$available", true] }, 1, 0] } }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    res.json({
      success: true,
      stats: stats[0] || {
        totalItems: 0,
        availableItems: 0,
        todayItems: 0,
        hotItems: 0,
        averagePrice: 0,
        minPrice: 0,
        maxPrice: 0
      },
      categories: categoryStats
    });
  } catch (error) {
    console.error('Get menu stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to get menu statistics'
    });
  }
};