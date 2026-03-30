// backend/src/routes/user/menu.js
const express = require('express');
const router = express.Router();
const {
  getTodayMenuForUser,
  getAllCafeterias,
  checkCafeteriaHours
} = require('../../controllers/user/menuController');

router.get('/cafeterias', getAllCafeterias);
router.get('/:cafeteriaName/today', getTodayMenuForUser);
router.get('/:cafeteriaName/hours', checkCafeteriaHours);

module.exports = router;