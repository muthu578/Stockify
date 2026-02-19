const Bill = require('../models/Bill');
const Item = require('../models/Item');

// @desc    Get sales statistics
// @route   GET /api/reports/sales
// @access  Private/Admin
const getSalesStats = async (req, res) => {
    try {
        const sales = await Bill.aggregate([
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    totalSales: { $sum: "$finalAmount" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const totalRevenue = await Bill.aggregate([
            {
                $group: {
                    _id: null,
                    total: { $sum: "$finalAmount" }
                }
            }
        ]);

        const totalOrders = await Bill.countDocuments();
        const totalItems = await Item.countDocuments();

        res.json({
            sales,
            totalRevenue: totalRevenue[0] ? totalRevenue[0].total : 0,
            totalOrders,
            totalItems
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get top selling items
// @route   GET /api/reports/top-items
// @access  Private/Admin
const getTopItems = async (req, res) => {
    try {
        const topItems = await Bill.aggregate([
            { $unwind: "$items" },
            {
                $group: {
                    _id: "$items.name",
                    totalQuantity: { $sum: "$items.quantity" },
                    totalRevenue: { $sum: "$items.subtotal" }
                }
            },
            { $sort: { totalQuantity: -1 } },
            { $limit: 5 }
        ]);

        res.json(topItems);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get detailed list of all sold items with categories
// @route   GET /api/reports/sold-items
// @access  Private/Admin
const getSoldItemsDetail = async (req, res) => {
    try {
        const soldItems = await Bill.aggregate([
            { $unwind: "$items" },
            {
                $lookup: {
                    from: "items",
                    localField: "items.item",
                    foreignField: "_id",
                    as: "itemDetails"
                }
            },
            { $unwind: "$itemDetails" },
            {
                $group: {
                    _id: "$items.item",
                    name: { $first: "$items.name" },
                    category: { $first: "$itemDetails.category" },
                    totalQuantity: { $sum: "$items.quantity" },
                    totalRevenue: { $sum: "$items.subtotal" }
                }
            },
            { $sort: { totalQuantity: -1 } }
        ]);

        res.json(soldItems);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get daily summary (cash vs card vs upi)
// @route   GET /api/reports/daily-summary
// @access  Private/Admin
const getDailySummary = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const summary = await Bill.aggregate([
            { $match: { createdAt: { $gte: today } } },
            {
                $group: {
                    _id: "$paymentMethod",
                    total: { $sum: "$finalAmount" },
                    count: { $count: {} }
                }
            }
        ]);

        res.json(summary);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getSalesStats, getTopItems, getSoldItemsDetail, getDailySummary };
