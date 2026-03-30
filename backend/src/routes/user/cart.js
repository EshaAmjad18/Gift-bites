// backend/src/routes/user/cart.js
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../../middleware/authMiddleware');
const cartController = require('../../controllers/user/cartController');

// Public test route (no auth required)
router.get('/test', cartController.testCart);

// All cart routes require authentication
router.use(authMiddleware);

// Cart CRUD operations
router.get('/', cartController.getCart);                     // Get user's cart
router.post('/add', cartController.addToCart);               // Add item to cart
router.put('/:itemId', cartController.updateCartItem);       // Update item quantity
router.delete('/:itemId', cartController.removeFromCart);    // Remove item from cart
router.delete('/', cartController.clearCart);                // Clear entire cart
router.get('/count', cartController.getCartCount);           // Get cart item count

module.exports = router;