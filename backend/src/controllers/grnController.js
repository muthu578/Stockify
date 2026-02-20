const GRN = require('../models/GRN');
const PurchaseOrder = require('../models/PurchaseOrder');
const Item = require('../models/Item');

// Generate next GRN number: GRN-2026-00001
const generateGRNNumber = async () => {
    const year = new Date().getFullYear();
    const prefix = `GRN-${year}-`;
    const lastGRN = await GRN.findOne({ grnNumber: { $regex: `^${prefix}` } })
        .sort({ grnNumber: -1 });

    if (lastGRN) {
        const lastNum = parseInt(lastGRN.grnNumber.replace(prefix, ''));
        return `${prefix}${String(lastNum + 1).padStart(5, '0')}`;
    }
    return `${prefix}00001`;
};

// @desc    Get all GRNs
// @route   GET /api/grn
const getGRNs = async (req, res) => {
    try {
        const { status } = req.query;
        const filter = {};
        if (status && status !== 'All') filter.status = status;

        const grns = await GRN.find(filter)
            .populate('purchaseOrder', 'poNumber')
            .populate('supplier', 'name phone')
            .populate('createdBy', 'name')
            .sort({ createdAt: -1 });

        res.json(grns);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single GRN
// @route   GET /api/grn/:id
const getGRNById = async (req, res) => {
    try {
        const grn = await GRN.findById(req.params.id)
            .populate('purchaseOrder', 'poNumber status')
            .populate('supplier', 'name phone email address')
            .populate('createdBy', 'name')
            .populate('items.item', 'name barcode category stock unit');

        if (!grn) {
            return res.status(404).json({ message: 'GRN not found' });
        }
        res.json(grn);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get pending POs available for GRN (status Sent or Partial)
// @route   GET /api/grn/pending-pos
const getPendingPOs = async (req, res) => {
    try {
        const pos = await PurchaseOrder.find({ status: { $in: ['Sent', 'Partial'] } })
            .populate('supplier', 'name phone')
            .populate('items.item', 'name barcode category stock unit')
            .sort({ createdAt: -1 });

        res.json(pos);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create GRN from a Purchase Order
// @route   POST /api/grn
const createGRN = async (req, res) => {
    try {
        const { purchaseOrder: poId, items, invoiceNumber, invoiceDate, receivedDate, notes } = req.body;

        if (!poId) {
            return res.status(400).json({ message: 'Purchase Order is required' });
        }
        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'At least one item is required' });
        }

        const po = await PurchaseOrder.findById(poId);
        if (!po) {
            return res.status(404).json({ message: 'Purchase Order not found' });
        }
        if (!['Sent', 'Partial'].includes(po.status)) {
            return res.status(400).json({ message: 'PO must be in Sent or Partial status to receive goods' });
        }

        const grnNumber = await generateGRNNumber();
        const totalAmount = items.reduce((acc, item) => acc + item.subtotal, 0);

        const grn = new GRN({
            grnNumber,
            purchaseOrder: poId,
            supplier: po.supplier,
            items,
            totalAmount,
            invoiceNumber,
            invoiceDate,
            receivedDate: receivedDate || new Date(),
            notes,
            createdBy: req.user._id,
        });

        const created = await grn.save();

        // Update PO receivedQty per item
        for (const grnItem of items) {
            const poItem = po.items.find(pi =>
                pi.item.toString() === grnItem.item.toString()
            );
            if (poItem) {
                poItem.receivedQty = (poItem.receivedQty || 0) + grnItem.acceptedQty;
            }
        }

        // Determine if PO is fully received or partially
        const allReceived = po.items.every(pi => pi.receivedQty >= pi.quantity);
        po.status = allReceived ? 'Completed' : 'Partial';
        await po.save();

        // Update inventory stock with accepted quantities
        for (const grnItem of items) {
            if (grnItem.acceptedQty > 0) {
                const item = await Item.findById(grnItem.item);
                if (item) {
                    item.stock += grnItem.acceptedQty;
                    item.buyPrice = grnItem.unitPrice;
                    await item.save();
                }
            }
        }

        const populated = await GRN.findById(created._id)
            .populate('purchaseOrder', 'poNumber')
            .populate('supplier', 'name phone')
            .populate('createdBy', 'name');

        res.status(201).json(populated);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update GRN status
// @route   PATCH /api/grn/:id/status
const updateGRNStatus = async (req, res) => {
    try {
        const grn = await GRN.findById(req.params.id);
        if (!grn) {
            return res.status(404).json({ message: 'GRN not found' });
        }

        const { status } = req.body;
        const validTransitions = {
            'Draft': ['Inspected', 'Completed'],
            'Inspected': ['Completed'],
        };

        const allowed = validTransitions[grn.status] || [];
        if (!allowed.includes(status)) {
            return res.status(400).json({
                message: `Cannot change status from "${grn.status}" to "${status}"`
            });
        }

        grn.status = status;
        await grn.save();
        res.json(grn);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    getGRNs,
    getGRNById,
    getPendingPOs,
    createGRN,
    updateGRNStatus,
};
