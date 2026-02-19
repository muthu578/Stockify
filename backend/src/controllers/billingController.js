const Bill = require('../models/Bill');
const Item = require('../models/Item');

// @desc    Create new bill
// @route   POST /api/billing
// @access  Private
const createBill = async (req, res) => {
    const { items, totalAmount, discount, tax, finalAmount, paymentMethod, customer } = req.body;

    if (items && items.length === 0) {
        res.status(400).json({ message: 'No items in bill' });
        return;
    }

    try {
        const billId = `BILL-${Date.now()}`;

        const bill = new Bill({
            billId,
            items,
            totalAmount,
            discount,
            tax,
            finalAmount,
            paymentMethod,
            customer,
            cashier: req.user._id,
        });

        const createdBill = await bill.save();

        // Update Inventory
        for (let itemData of items) {
            await Item.findByIdAndUpdate(itemData.item, {
                $inc: { stock: -itemData.quantity }
            });
        }

        res.status(201).json(createdBill);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get all bills
// @route   GET /api/billing
// @access  Private
const getBills = async (req, res) => {
    try {
        const bills = await Bill.find({}).populate('cashier', 'name').populate('customer', 'name phone').sort({ createdAt: -1 });
        res.json(bills);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get bill by ID
// @route   GET /api/billing/:id
// @access  Private
const getBillById = async (req, res) => {
    const bill = await Bill.findById(req.params.id).populate('cashier', 'name').populate('customer', 'name phone email address');

    if (bill) {
        res.json(bill);
    } else {
        res.status(404).json({ message: 'Bill not found' });
    }
};

module.exports = { createBill, getBills, getBillById };
