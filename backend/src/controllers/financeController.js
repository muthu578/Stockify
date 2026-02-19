const Account = require('../models/Account');
const Expense = require('../models/Expense');

// @desc    Get all bank accounts
// @route   GET /api/accounts
const getAccounts = async (req, res) => {
    try {
        const accounts = await Account.find({});
        res.json(accounts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create account
// @route   POST /api/accounts
const createAccount = async (req, res) => {
    try {
        const account = await Account.create(req.body);
        res.status(201).json(account);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get expenses
// @route   GET /api/expenses
const getExpenses = async (req, res) => {
    try {
        const expenses = await Expense.find({}).populate('paymentAccount', 'accountName');
        res.json(expenses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create expense
// @route   POST /api/expenses
const createExpense = async (req, res) => {
    try {
        const { expenseTitle, category, amount, paymentAccount, description } = req.body;

        const expense = await Expense.create({
            expenseTitle, category, amount, paymentAccount, description,
            createdBy: req.user._id
        });

        // Deduct from account balance
        const account = await Account.findById(paymentAccount);
        if (account) {
            account.balance -= amount;
            await account.save();
        }

        res.status(201).json(expense);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    getAccounts,
    createAccount,
    getExpenses,
    createExpense
};
