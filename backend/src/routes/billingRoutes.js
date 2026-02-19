const express = require('express');
const router = express.Router();
const { createBill, getBills, getBillById } = require('../controllers/billingController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getBills)
    .post(protect, createBill);

router.get('/:id', protect, getBillById);

module.exports = router;
