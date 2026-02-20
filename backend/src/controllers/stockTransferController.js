const StockTransfer = require('../models/StockTransfer');

const generateTransferNumber = async () => {
    const year = new Date().getFullYear();
    const prefix = `ST-${year}-`;
    const last = await StockTransfer.findOne({ transferNumber: { $regex: `^${prefix}` } }).sort({ transferNumber: -1 });
    if (last) {
        const num = parseInt(last.transferNumber.replace(prefix, ''));
        return `${prefix}${String(num + 1).padStart(5, '0')}`;
    }
    return `${prefix}00001`;
};

const getStockTransfers = async (req, res) => {
    try {
        const { status } = req.query;
        const filter = {};
        if (status && status !== 'All') filter.status = status;
        const transfers = await StockTransfer.find(filter)
            .populate('items.item', 'name barcode')
            .populate('createdBy', 'name')
            .sort({ createdAt: -1 });
        res.json(transfers);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

const createStockTransfer = async (req, res) => {
    try {
        const { fromLocation, toLocation, items, reason } = req.body;
        if (!fromLocation || !toLocation) return res.status(400).json({ message: 'Both locations required' });
        if (!items || items.length === 0) return res.status(400).json({ message: 'At least one item required' });
        const transferNumber = await generateTransferNumber();
        const transfer = await new StockTransfer({ transferNumber, fromLocation, toLocation, items, reason, createdBy: req.user._id }).save();
        const populated = await StockTransfer.findById(transfer._id).populate('items.item', 'name barcode').populate('createdBy', 'name');
        res.status(201).json(populated);
    } catch (error) { res.status(400).json({ message: error.message }); }
};

const updateTransferStatus = async (req, res) => {
    try {
        const transfer = await StockTransfer.findById(req.params.id);
        if (!transfer) return res.status(404).json({ message: 'Transfer not found' });
        const { status } = req.body;
        const valid = { 'Pending': ['In Transit', 'Cancelled'], 'In Transit': ['Completed', 'Cancelled'] };
        if (!(valid[transfer.status] || []).includes(status))
            return res.status(400).json({ message: `Cannot change from "${transfer.status}" to "${status}"` });
        transfer.status = status;
        await transfer.save();
        res.json(transfer);
    } catch (error) { res.status(400).json({ message: error.message }); }
};

const deleteStockTransfer = async (req, res) => {
    try {
        const transfer = await StockTransfer.findById(req.params.id);
        if (!transfer) return res.status(404).json({ message: 'Transfer not found' });
        if (transfer.status !== 'Pending') return res.status(400).json({ message: 'Only pending transfers can be deleted' });
        await StockTransfer.findByIdAndDelete(req.params.id);
        res.json({ message: 'Transfer deleted' });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

module.exports = { getStockTransfers, createStockTransfer, updateTransferStatus, deleteStockTransfer };
