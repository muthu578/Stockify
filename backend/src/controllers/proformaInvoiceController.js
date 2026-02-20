const ProformaInvoice = require('../models/ProformaInvoice');

const generateInvoiceNumber = async () => {
    const year = new Date().getFullYear();
    const prefix = `PI-${year}-`;
    const last = await ProformaInvoice.findOne({ invoiceNumber: { $regex: `^${prefix}` } }).sort({ invoiceNumber: -1 });
    if (last) {
        const num = parseInt(last.invoiceNumber.replace(prefix, ''));
        return `${prefix}${String(num + 1).padStart(5, '0')}`;
    }
    return `${prefix}00001`;
};

const getProformaInvoices = async (req, res) => {
    try {
        const { status } = req.query;
        const filter = {};
        if (status && status !== 'All') filter.status = status;
        const invoices = await ProformaInvoice.find(filter)
            .populate('customer', 'name phone email')
            .populate('createdBy', 'name')
            .sort({ createdAt: -1 });
        res.json(invoices);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

const getProformaInvoiceById = async (req, res) => {
    try {
        const inv = await ProformaInvoice.findById(req.params.id)
            .populate('customer', 'name phone email address')
            .populate('createdBy', 'name')
            .populate('items.item', 'name barcode category');
        if (!inv) return res.status(404).json({ message: 'Invoice not found' });
        res.json(inv);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

const createProformaInvoice = async (req, res) => {
    try {
        const { customer, items, taxRate, validUntil, notes } = req.body;
        if (!customer) return res.status(400).json({ message: 'Customer is required' });
        if (!items || items.length === 0) return res.status(400).json({ message: 'At least one item required' });
        const invoiceNumber = await generateInvoiceNumber();
        const totalAmount = items.reduce((acc, i) => acc + i.subtotal, 0);
        const tax = taxRate || 0;
        const taxAmount = (totalAmount * tax) / 100;
        const grandTotal = totalAmount + taxAmount;
        const inv = await new ProformaInvoice({ invoiceNumber, customer, items, totalAmount, taxRate: tax, taxAmount, grandTotal, validUntil, notes, createdBy: req.user._id }).save();
        const populated = await ProformaInvoice.findById(inv._id).populate('customer', 'name phone email').populate('createdBy', 'name');
        res.status(201).json(populated);
    } catch (error) { res.status(400).json({ message: error.message }); }
};

const updateProformaStatus = async (req, res) => {
    try {
        const inv = await ProformaInvoice.findById(req.params.id);
        if (!inv) return res.status(404).json({ message: 'Invoice not found' });
        const { status } = req.body;
        const valid = { 'Draft': ['Sent', 'Cancelled'], 'Sent': ['Accepted', 'Expired', 'Cancelled'] };
        if (!(valid[inv.status] || []).includes(status))
            return res.status(400).json({ message: `Cannot change from "${inv.status}" to "${status}"` });
        inv.status = status;
        await inv.save();
        res.json(inv);
    } catch (error) { res.status(400).json({ message: error.message }); }
};

const deleteProformaInvoice = async (req, res) => {
    try {
        const inv = await ProformaInvoice.findById(req.params.id);
        if (!inv) return res.status(404).json({ message: 'Invoice not found' });
        if (inv.status !== 'Draft') return res.status(400).json({ message: 'Only draft invoices can be deleted' });
        await ProformaInvoice.findByIdAndDelete(req.params.id);
        res.json({ message: 'Invoice deleted' });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

module.exports = { getProformaInvoices, getProformaInvoiceById, createProformaInvoice, updateProformaStatus, deleteProformaInvoice };
