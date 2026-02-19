const express = require('express');
const router = express.Router();
const { getAccounts, createAccount, getExpenses, createExpense } = require('../controllers/financeController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/accounts').get(protect, getAccounts).post(protect, admin, createAccount);
router.route('/expenses').get(protect, getExpenses).post(protect, admin, createExpense);

module.exports = router;
