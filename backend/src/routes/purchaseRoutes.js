const express = require('express');
const router = express.Router();
const { getPurchases, createPurchase } = require('../controllers/purchaseController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, admin, getPurchases)
    .post(protect, admin, createPurchase);

module.exports = router;
