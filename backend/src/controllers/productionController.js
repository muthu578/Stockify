const Production = require('../models/Production');
const Item = require('../models/Item');

const generateBatchNumber = async () => {
    const year = new Date().getFullYear();
    const prefix = `BATCH-${year}-`;
    const last = await Production.findOne({ batchNumber: { $regex: `^${prefix}` } }).sort({ batchNumber: -1 });
    if (last) {
        const num = parseInt(last.batchNumber.replace(prefix, ''));
        return `${prefix}${String(num + 1).padStart(5, '0')}`;
    }
    return `${prefix}00001`;
};

const getProductions = async (req, res) => {
    try {
        const { status } = req.query;
        const filter = {};
        if (status && status !== 'All') filter.status = status;
        const productions = await Production.find(filter)
            .populate('machine', 'name machineCode')
            .populate('item', 'name category')
            .populate('createdBy', 'name')
            .sort({ createdAt: -1 });
        res.json(productions);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

const createProduction = async (req, res) => {
    try {
        const { machine, item, itemName, plannedQty, startDate, notes } = req.body;
        if (!machine || !item || !plannedQty) return res.status(400).json({ message: 'Machine, item, and planned quantity required' });
        const batchNumber = await generateBatchNumber();
        const production = await new Production({ batchNumber, machine, item, itemName, plannedQty, startDate: startDate || new Date(), notes, createdBy: req.user._id }).save();
        const populated = await Production.findById(production._id).populate('machine', 'name machineCode').populate('item', 'name category').populate('createdBy', 'name');
        res.status(201).json(populated);
    } catch (error) { res.status(400).json({ message: error.message }); }
};

const updateProduction = async (req, res) => {
    try {
        const prod = await Production.findById(req.params.id);
        if (!prod) return res.status(404).json({ message: 'Production entry not found' });
        const { producedQty, rejectedQty, endDate, status, notes } = req.body;
        if (producedQty !== undefined) prod.producedQty = producedQty;
        if (rejectedQty !== undefined) prod.rejectedQty = rejectedQty;
        if (endDate) prod.endDate = endDate;
        if (notes !== undefined) prod.notes = notes;
        if (status) {
            const valid = { 'Planned': ['In Progress', 'Cancelled'], 'In Progress': ['Completed', 'Cancelled'] };
            if (!(valid[prod.status] || []).includes(status))
                return res.status(400).json({ message: `Cannot change from "${prod.status}" to "${status}"` });
            prod.status = status;
            // On completion, add produced qty to inventory
            if (status === 'Completed' && prod.producedQty > 0) {
                const item = await Item.findById(prod.item);
                if (item) { item.stock += prod.producedQty; await item.save(); }
            }
        }
        await prod.save();
        const populated = await Production.findById(prod._id).populate('machine', 'name machineCode').populate('item', 'name category');
        res.json(populated);
    } catch (error) { res.status(400).json({ message: error.message }); }
};

const deleteProduction = async (req, res) => {
    try {
        const prod = await Production.findById(req.params.id);
        if (!prod) return res.status(404).json({ message: 'Production entry not found' });
        if (prod.status !== 'Planned') return res.status(400).json({ message: 'Only planned entries can be deleted' });
        await Production.findByIdAndDelete(req.params.id);
        res.json({ message: 'Production entry deleted' });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

module.exports = { getProductions, createProduction, updateProduction, deleteProduction };
