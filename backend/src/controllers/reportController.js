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

// @desc    Get daily stock snapshot
// @route   GET /api/reports/daily-stocks
// @access  Private/Admin
const getDailyStocks = async (req, res) => {
    try {
        const items = await Item.find({}).sort({ category: 1, name: 1 });
        const date = req.query.date || new Date().toISOString().split('T')[0];

        const stockData = items.map(item => ({
            _id: item._id,
            name: item.name,
            barcode: item.barcode,
            category: item.category,
            stock: item.stock,
            unit: item.unit,
            price: item.price,
            buyPrice: item.buyPrice || 0,
            stockValue: item.stock * item.price,
            costValue: item.stock * (item.buyPrice || 0),
            alert: item.stock === 0 ? 'OUT' : item.stock < 10 ? 'LOW' : 'OK',
        }));

        const summary = {
            date,
            totalItems: items.length,
            totalStock: items.reduce((a, i) => a + i.stock, 0),
            totalValue: items.reduce((a, i) => a + (i.stock * i.price), 0),
            totalCost: items.reduce((a, i) => a + (i.stock * (i.buyPrice || 0)), 0),
            lowStock: items.filter(i => i.stock > 0 && i.stock < 10).length,
            outOfStock: items.filter(i => i.stock === 0).length,
        };

        res.json({ summary, items: stockData });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get total stock report with category breakdown
// @route   GET /api/reports/total-stock
// @access  Private/Admin
const getTotalStock = async (req, res) => {
    try {
        const items = await Item.find({}).sort({ name: 1 });

        const categorySummary = {};
        items.forEach(item => {
            const cat = item.category || 'Uncategorized';
            if (!categorySummary[cat]) categorySummary[cat] = { count: 0, stock: 0, value: 0, cost: 0 };
            categorySummary[cat].count++;
            categorySummary[cat].stock += item.stock;
            categorySummary[cat].value += item.stock * item.price;
            categorySummary[cat].cost += item.stock * (item.buyPrice || 0);
        });

        const categories = Object.entries(categorySummary).map(([category, data]) => ({
            category,
            ...data,
            margin: data.value - data.cost,
        }));

        const totals = {
            totalItems: items.length,
            totalStock: items.reduce((a, i) => a + i.stock, 0),
            totalValue: items.reduce((a, i) => a + (i.stock * i.price), 0),
            totalCost: items.reduce((a, i) => a + (i.stock * (i.buyPrice || 0)), 0),
        };
        totals.totalMargin = totals.totalValue - totals.totalCost;

        res.json({ totals, categories, items });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get batch-wise / category-wise item report
// @route   GET /api/reports/batchwise-items
// @access  Private/Admin
const getBatchwiseItems = async (req, res) => {
    try {
        const items = await Item.find({}).sort({ category: 1, name: 1 });

        const grouped = {};
        items.forEach(item => {
            const cat = item.category || 'Uncategorized';
            if (!grouped[cat]) grouped[cat] = { items: [], totalStock: 0, totalValue: 0 };
            grouped[cat].items.push({
                _id: item._id,
                name: item.name,
                barcode: item.barcode,
                stock: item.stock,
                unit: item.unit,
                price: item.price,
                value: item.stock * item.price,
            });
            grouped[cat].totalStock += item.stock;
            grouped[cat].totalValue += item.stock * item.price;
        });

        const batches = Object.entries(grouped).map(([category, data]) => ({
            category,
            itemCount: data.items.length,
            totalStock: data.totalStock,
            totalValue: data.totalValue,
            items: data.items,
        }));

        res.json({
            totalCategories: batches.length,
            totalItems: items.length,
            totalStock: items.reduce((a, i) => a + i.stock, 0),
            totalValue: items.reduce((a, i) => a + (i.stock * i.price), 0),
            batches,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getSalesStats, getTopItems, getSoldItemsDetail, getDailySummary, getDailyStocks, getTotalStock, getBatchwiseItems };

