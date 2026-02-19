const express = require('express');
const router = express.Router();
const { getSalesStats, getTopItems, getSoldItemsDetail, getDailySummary } = require('../controllers/reportController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/sales', protect, admin, getSalesStats);
router.get('/top-items', protect, admin, getTopItems);
router.get('/sold-items', protect, admin, getSoldItemsDetail);
router.get('/daily-summary', protect, admin, getDailySummary);

module.exports = router;
