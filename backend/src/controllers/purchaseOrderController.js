const PurchaseOrder = require('../models/PurchaseOrder');

// Generate next PO number: PO-2026-00001
const generatePONumber = async () => {
    const year = new Date().getFullYear();
    const prefix = `PO-${year}-`;
    const lastPO = await PurchaseOrder.findOne({ poNumber: { $regex: `^${prefix}` } })
        .sort({ poNumber: -1 });

    if (lastPO) {
        const lastNum = parseInt(lastPO.poNumber.replace(prefix, ''));
        return `${prefix}${String(lastNum + 1).padStart(5, '0')}`;
    }
    return `${prefix}00001`;
};

// @desc    Get all purchase orders
// @route   GET /api/purchase-orders
const getPurchaseOrders = async (req, res) => {
    try {
        const { status } = req.query;
        const filter = {};
        if (status && status !== 'All') filter.status = status;

        const orders = await PurchaseOrder.find(filter)
            .populate('supplier', 'name phone email')
            .populate('createdBy', 'name')
            .populate('items.item', 'name barcode category')
            .sort({ createdAt: -1 });

        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single purchase order
// @route   GET /api/purchase-orders/:id
const getPurchaseOrderById = async (req, res) => {
    try {
        const order = await PurchaseOrder.findById(req.params.id)
            .populate('supplier', 'name phone email address')
            .populate('createdBy', 'name')
            .populate('items.item', 'name barcode category stock unit');

        if (!order) {
            return res.status(404).json({ message: 'Purchase order not found' });
        }
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create new purchase order
// @route   POST /api/purchase-orders
const createPurchaseOrder = async (req, res) => {
    try {
        const { supplier, items, taxRate, notes, expectedDelivery } = req.body;

        if (!supplier) {
            return res.status(400).json({ message: 'Supplier is required' });
        }
        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'At least one item is required' });
        }

        const poNumber = await generatePONumber();
        const totalAmount = items.reduce((acc, item) => acc + item.subtotal, 0);
        const tax = taxRate || 0;
        const taxAmount = (totalAmount * tax) / 100;
        const grandTotal = totalAmount + taxAmount;

        const order = new PurchaseOrder({
            poNumber,
            supplier,
            items,
            totalAmount,
            taxRate: tax,
            taxAmount,
            grandTotal,
            notes,
            expectedDelivery,
            createdBy: req.user._id,
        });

        const created = await order.save();
        const populated = await PurchaseOrder.findById(created._id)
            .populate('supplier', 'name phone email')
            .populate('createdBy', 'name')
            .populate('items.item', 'name barcode category');

        res.status(201).json(populated);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update purchase order (only if Draft)
// @route   PUT /api/purchase-orders/:id
const updatePurchaseOrder = async (req, res) => {
    try {
        const order = await PurchaseOrder.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Purchase order not found' });
        }
        if (order.status !== 'Draft') {
            return res.status(400).json({ message: 'Only draft orders can be edited' });
        }

        const { supplier, items, taxRate, notes, expectedDelivery } = req.body;

        if (items) {
            order.items = items;
            order.totalAmount = items.reduce((acc, item) => acc + item.subtotal, 0);
        }
        if (supplier) order.supplier = supplier;
        if (taxRate !== undefined) {
            order.taxRate = taxRate;
            order.taxAmount = (order.totalAmount * taxRate) / 100;
        }
        order.grandTotal = order.totalAmount + order.taxAmount;
        if (notes !== undefined) order.notes = notes;
        if (expectedDelivery !== undefined) order.expectedDelivery = expectedDelivery;

        const updated = await order.save();
        const populated = await PurchaseOrder.findById(updated._id)
            .populate('supplier', 'name phone email')
            .populate('createdBy', 'name')
            .populate('items.item', 'name barcode category');

        res.json(populated);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update PO status
// @route   PATCH /api/purchase-orders/:id/status
const updatePOStatus = async (req, res) => {
    try {
        const order = await PurchaseOrder.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Purchase order not found' });
        }

        const { status } = req.body;
        const validTransitions = {
            'Draft': ['Sent', 'Cancelled'],
            'Sent': ['Partial', 'Completed', 'Cancelled'],
            'Partial': ['Completed', 'Cancelled'],
        };

        const allowed = validTransitions[order.status] || [];
        if (!allowed.includes(status)) {
            return res.status(400).json({
                message: `Cannot change status from "${order.status}" to "${status}"`
            });
        }

        order.status = status;
        const updated = await order.save();
        res.json(updated);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete purchase order (only if Draft)
// @route   DELETE /api/purchase-orders/:id
const deletePurchaseOrder = async (req, res) => {
    try {
        const order = await PurchaseOrder.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Purchase order not found' });
        }
        if (order.status !== 'Draft') {
            return res.status(400).json({ message: 'Only draft orders can be deleted' });
        }

        await PurchaseOrder.findByIdAndDelete(req.params.id);
        res.json({ message: 'Purchase order deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getPurchaseOrders,
    getPurchaseOrderById,
    createPurchaseOrder,
    updatePurchaseOrder,
    updatePOStatus,
    deletePurchaseOrder,
};
