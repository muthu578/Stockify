const express = require('express');
const router = express.Router();
const {
    getSalesStats,
    getTopItems,
    getSoldItemsDetail,
    getDailySummary,
    getDailyStocks,
    getTotalStock,
    getBatchwiseItems
} = require('../controllers/reportController');
const { protect, admin, manager } = require('../middleware/authMiddleware');

router.get('/sales', protect, manager, getSalesStats);
router.get('/top-items', protect, manager, getTopItems);
router.get('/sold-items', protect, manager, getSoldItemsDetail);
router.get('/daily-summary', protect, manager, getDailySummary);
router.get('/daily-stocks', protect, manager, getDailyStocks);
router.get('/total-stock', protect, manager, getTotalStock);
router.get('/batchwise-items', protect, manager, getBatchwiseItems);

module.exports = router;
