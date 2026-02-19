const Purchase = require('../models/Purchase');
const Item = require('../models/Item');

// @desc    Get all purchases
// @route   GET /api/purchases
// @access  Private/Admin
const getPurchases = async (req, res) => {
    try {
        const purchases = await Purchase.find({}).populate('supplier', 'name').populate('createdBy', 'name');
        res.json(purchases);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create new purchase
// @route   POST /api/purchases
// @access  Private/Admin
const createPurchase = async (req, res) => {
    try {
        const { supplier, items, totalAmount, paidAmount } = req.body;

        if (items && items.length === 0) {
            res.status(400).json({ message: 'No items in purchase' });
            return;
        }

        const purchaseId = `PUR-${Date.now()}`;
        const purchase = new Purchase({
            purchaseId,
            supplier,
            items,
            totalAmount,
            paidAmount,
            createdBy: req.user._id
        });

        const createdPurchase = await purchase.save();

        // Update inventory
        for (const itemData of items) {
            const item = await Item.findById(itemData.item);
            if (item) {
                item.stock += itemData.quantity;
                // Optionally update buy price
                item.buyPrice = itemData.purchasePrice;
                await item.save();
            }
        }

        res.status(201).json(createdPurchase);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    getPurchases,
    createPurchase
};
