// backend/src/routes/staff/menu.js
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../../middleware/authMiddleware');
const roleCheck = require('../../middleware/roleCheck');

const upload = require('../../middleware/uploadMiddleware');
const {
  addMenuItem,
  getMenuItems,
  updateMenuItem,
  deleteMenuItem,
  toggleAvailability,
  addToTodayMenu,     
  removeFromTodayMenu, 
  getTodayMenu        
} = require('../../controllers/staff/menuController');

// Apply auth middleware to all routes
router.use(authMiddleware);
router.use(roleCheck('staff'));

//  routes
router.post('/', upload.single('image'), addMenuItem);
router.get('/', getMenuItems);
router.put('/:id', upload.single('image'), updateMenuItem);
router.delete('/:id', deleteMenuItem);
router.patch('/:id/toggle', toggleAvailability);

// Today's Menu routes
router.post('/:id/add-today', addToTodayMenu);
router.post('/:id/remove-today', removeFromTodayMenu);
router.get('/today', getTodayMenu);

module.exports = router;