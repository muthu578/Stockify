const DeliveryChallan = require('../models/DeliveryChallan');

const generateChallanNumber = async () => {
    const year = new Date().getFullYear();
    const prefix = `DC-${year}-`;
    const last = await DeliveryChallan.findOne({ challanNumber: { $regex: `^${prefix}` } }).sort({ challanNumber: -1 });
    if (last) {
        const num = parseInt(last.challanNumber.replace(prefix, ''));
        return `${prefix}${String(num + 1).padStart(5, '0')}`;
    }
    return `${prefix}00001`;
};

const getDeliveryChallans = async (req, res) => {
    try {
        const { status } = req.query;
        const filter = {};
        if (status && status !== 'All') filter.status = status;
        const challans = await DeliveryChallan.find(filter)
            .populate('customer', 'name phone')
            .populate('createdBy', 'name')
            .sort({ createdAt: -1 });
        res.json(challans);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

const getDeliveryChallanById = async (req, res) => {
    try {
        const dc = await DeliveryChallan.findById(req.params.id)
            .populate('customer', 'name phone email address')
            .populate('createdBy', 'name')
            .populate('items.item', 'name barcode category');
        if (!dc) return res.status(404).json({ message: 'Challan not found' });
        res.json(dc);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

const createDeliveryChallan = async (req, res) => {
    try {
        const { customer, items, vehicleNumber, driverName, transportMode, dispatchDate, notes } = req.body;
        if (!customer) return res.status(400).json({ message: 'Customer is required' });
        if (!items || items.length === 0) return res.status(400).json({ message: 'At least one item required' });
        const challanNumber = await generateChallanNumber();
        const dc = await new DeliveryChallan({ challanNumber, customer, items, vehicleNumber, driverName, transportMode, dispatchDate, notes, createdBy: req.user._id }).save();
        const populated = await DeliveryChallan.findById(dc._id).populate('customer', 'name phone').populate('createdBy', 'name');
        res.status(201).json(populated);
    } catch (error) { res.status(400).json({ message: error.message }); }
};

const updateChallanStatus = async (req, res) => {
    try {
        const dc = await DeliveryChallan.findById(req.params.id);
        if (!dc) return res.status(404).json({ message: 'Challan not found' });
        const { status } = req.body;
        const valid = { 'Draft': ['Dispatched', 'Cancelled'], 'Dispatched': ['Delivered', 'Cancelled'] };
        if (!(valid[dc.status] || []).includes(status))
            return res.status(400).json({ message: `Cannot change from "${dc.status}" to "${status}"` });
        dc.status = status;
        if (status === 'Delivered') dc.deliveryDate = new Date();
        await dc.save();
        res.json(dc);
    } catch (error) { res.status(400).json({ message: error.message }); }
};

const deleteDeliveryChallan = async (req, res) => {
    try {
        const dc = await DeliveryChallan.findById(req.params.id);
        if (!dc) return res.status(404).json({ message: 'Challan not found' });
        if (dc.status !== 'Draft') return res.status(400).json({ message: 'Only draft challans can be deleted' });
        await DeliveryChallan.findByIdAndDelete(req.params.id);
        res.json({ message: 'Challan deleted' });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

module.exports = { getDeliveryChallans, getDeliveryChallanById, createDeliveryChallan, updateChallanStatus, deleteDeliveryChallan };
