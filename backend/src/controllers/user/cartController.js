// backend/src/controllers/user/cartController.js
const Cart = require('../../models/Cart');
const MenuItem = require('../../models/MenuItem');

// Get user's cart
const getCart = async (req, res) => {
  try {
    console.log('=== GET CART ===');
    console.log('User ID:', req.user?._id);
    
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const userId = req.user._id;
    
    // Find cart for this user
    let cart = await Cart.findOne({ user: userId })
      .populate('items.menuItem', 'name price image category available cafeteria');
    
    // If no cart exists, create one
    if (!cart) {
      console.log('No cart found, creating new empty cart...');
      
      // Create cart with manual total calculation to avoid hook issues
      cart = new Cart({
        user: userId,
        cafeteria: 'Basement Cafe',
        items: [],
        total: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      await cart.save();
      console.log('✅ Created new empty cart');
    }
    
    // Calculate item count
    const itemCount = cart.items ? cart.items.reduce((sum, item) => sum + (item.quantity || 0), 0) : 0;
    
    res.json({
      success: true,
      cart: {
        _id: cart._id,
        user: cart.user,
        cafeteria: cart.cafeteria,
        items: cart.items || [],
        total: cart.total || 0,
        itemCount: itemCount,
        createdAt: cart.createdAt,
        updatedAt: cart.updatedAt
      }
    });
  } catch (error) {
    console.error('❌ Get cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cart',
      error: error.message
    });
  }
};

// Add item to cart
const addToCart = async (req, res) => {
  try {
    console.log('=== ADD TO CART ===');
    console.log('User ID:', req.user?._id);
    console.log('Request body:', req.body);
    
    const { itemId, quantity } = req.body;
    const userId = req.user._id;
    
    // Validate input
    if (!itemId || !quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Item ID and quantity (minimum 1) are required'
      });
    }
    
    // Get the menu item
    const menuItem = await MenuItem.findById(itemId);
    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }
    
    // Check if item is available today
    if (!menuItem.available || !menuItem.availableToday) {
      return res.status(400).json({
        success: false,
        message: 'This item is not available today'
      });
    }
    
    // Find or create cart for user
    let cart = await Cart.findOne({ user: userId });
    
    if (!cart) {
      // Create new cart
      cart = new Cart({
        user: userId,
        cafeteria: menuItem.cafeteria,
        items: [],
        total: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      await cart.save();
      console.log('✅ Created new cart for user:', userId);
    }
    
    // Check if cart already has items from different cafeteria
    if (cart.items.length > 0 && cart.cafeteria !== menuItem.cafeteria) {
      return res.status(400).json({
        success: false,
        message: `Your cart contains items from ${cart.cafeteria}. Please clear your cart first to add items from ${menuItem.cafeteria}.`
      });
    }
    
    // Update cafeteria if cart was empty
    if (cart.items.length === 0) {
      cart.cafeteria = menuItem.cafeteria;
    }
    
    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.menuItem && item.menuItem.toString() === itemId
    );
    
    if (existingItemIndex > -1) {
      // Update quantity of existing item
      cart.items[existingItemIndex].quantity += quantity;
      console.log(`✅ Updated quantity for item: ${menuItem.name}`);
    } else {
      // Add new item to cart
      cart.items.push({
        menuItem: itemId,
        quantity: quantity,
        price: menuItem.price,
        itemName: menuItem.name,
        image: menuItem.image
      });
      console.log(`✅ Added new item to cart: ${menuItem.name}`);
    }
    
    // Manually calculate total
    cart.total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cart.updatedAt = new Date();
    
    await cart.save();
    
    // Calculate updated item count
    const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    
    res.json({
      success: true,
      message: 'Item added to cart successfully',
      cart: {
        _id: cart._id,
        total: cart.total,
        itemCount: itemCount,
        cafeteria: cart.cafeteria
      }
    });
  } catch (error) {
    console.error('❌ Add to cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add item to cart',
      error: error.message
    });
  }
};

// Update cart item quantity
const updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;
    const userId = req.user._id;
    
    console.log('=== UPDATE CART ITEM ===');
    console.log('Cart item ID:', itemId);
    console.log('New quantity:', quantity);
    
    if (!quantity || quantity < 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid quantity is required'
      });
    }
    
    // Find user's cart
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }
    
    // Find the item in cart
    const itemIndex = cart.items.findIndex(
      item => item._id.toString() === itemId
    );
    
    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }
    
    if (quantity === 0) {
      // Remove item if quantity is 0
      cart.items.splice(itemIndex, 1);
      console.log('✅ Removed item from cart');
    } else {
      // Update quantity
      cart.items[itemIndex].quantity = quantity;
      console.log(`✅ Updated item quantity to ${quantity}`);
    }
    
    // Update total
    cart.total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cart.updatedAt = new Date();
    
    await cart.save();
    
    const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    
    res.json({
      success: true,
      message: 'Cart updated successfully',
      cart: {
        total: cart.total,
        itemCount: itemCount
      }
    });
  } catch (error) {
    console.error('❌ Update cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update cart',
      error: error.message
    });
  }
};

// Remove item from cart
const removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;
    const userId = req.user._id;
    
    console.log('=== REMOVE FROM CART ===');
    console.log('Cart item ID:', itemId);
    
    // Find user's cart
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }
    
    // Filter out the item to remove
    const initialLength = cart.items.length;
    cart.items = cart.items.filter(
      item => item._id.toString() !== itemId
    );
    
    if (cart.items.length === initialLength) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }
    
    // Update total
    cart.total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cart.updatedAt = new Date();
    
    await cart.save();
    
    const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    
    console.log('✅ Item removed from cart');
    
    res.json({
      success: true,
      message: 'Item removed from cart',
      cart: {
        total: cart.total,
        itemCount: itemCount
      }
    });
  } catch (error) {
    console.error('❌ Remove from cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove item from cart',
      error: error.message
    });
  }
};

// Clear entire cart
const clearCart = async (req, res) => {
  try {
    const userId = req.user._id;
    
    console.log('=== CLEAR CART ===');
    console.log('User ID:', userId);
    
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }
    
    // Clear all items
    cart.items = [];
    cart.total = 0;
    cart.updatedAt = new Date();
    
    await cart.save();
    
    console.log('✅ Cart cleared successfully');
    
    res.json({
      success: true,
      message: 'Cart cleared successfully'
    });
  } catch (error) {
    console.error('❌ Clear cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear cart',
      error: error.message
    });
  }
};

// Get cart item count
const getCartCount = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const cart = await Cart.findOne({ user: userId });
    const count = cart ? cart.items.reduce((sum, item) => sum + item.quantity, 0) : 0;
    
    res.json({
      success: true,
      count: count
    });
  } catch (error) {
    console.error('❌ Get cart count error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get cart count',
      error: error.message
    });
  }
};

// Test endpoint
const testCart = async (req, res) => {
  res.json({
    success: true,
    message: 'Cart API is working',
    timestamp: new Date().toISOString(),
    user: req.user ? req.user._id : 'Not authenticated'
  });
};

// Export all functions
module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getCartCount,
  testCart
};