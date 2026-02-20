const mongoose = require('mongoose');

const poItemSchema = new mongoose.Schema({
    item: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item',
        required: true,
    },
    itemName: {
        type: String,
        required: true,
    },
    unitPrice: {
        type: Number,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
    },
    receivedQty: {
        type: Number,
        default: 0,
    },
    unit: {
        type: String,
        default: 'pcs',
    },
    subtotal: {
        type: Number,
        required: true,
    }
});

const purchaseOrderSchema = new mongoose.Schema({
    poNumber: {
        type: String,
        required: true,
        unique: true,
    },
    supplier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Contact',
        required: true,
    },
    items: [poItemSchema],
    totalAmount: {
        type: Number,
        required: true,
    },
    taxRate: {
        type: Number,
        default: 0,
    },
    taxAmount: {
        type: Number,
        default: 0,
    },
    grandTotal: {
        type: Number,
        required: true,
    },
    notes: {
        type: String,
    },
    expectedDelivery: {
        type: Date,
    },
    status: {
        type: String,
        enum: ['Draft', 'Sent', 'Partial', 'Completed', 'Cancelled'],
        default: 'Draft',
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
}, {
    timestamps: true,
});

const PurchaseOrder = mongoose.model('PurchaseOrder', purchaseOrderSchema);

module.exports = PurchaseOrder;
