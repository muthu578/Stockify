const mongoose = require('mongoose');

const grnItemSchema = new mongoose.Schema({
    item: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item',
        required: true,
    },
    itemName: {
        type: String,
        required: true,
    },
    orderedQty: {
        type: Number,
        required: true,
    },
    receivedQty: {
        type: Number,
        required: true,
        min: 0,
    },
    acceptedQty: {
        type: Number,
        required: true,
        min: 0,
    },
    rejectedQty: {
        type: Number,
        default: 0,
    },
    unitPrice: {
        type: Number,
        required: true,
    },
    unit: {
        type: String,
        default: 'pcs',
    },
    subtotal: {
        type: Number,
        required: true,
    },
    remarks: {
        type: String,
    }
});

const grnSchema = new mongoose.Schema({
    grnNumber: {
        type: String,
        required: true,
        unique: true,
    },
    purchaseOrder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PurchaseOrder',
        required: true,
    },
    supplier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Contact',
        required: true,
    },
    items: [grnItemSchema],
    totalAmount: {
        type: Number,
        required: true,
    },
    invoiceNumber: {
        type: String,
    },
    invoiceDate: {
        type: Date,
    },
    receivedDate: {
        type: Date,
        default: Date.now,
    },
    notes: {
        type: String,
    },
    status: {
        type: String,
        enum: ['Draft', 'Inspected', 'Completed'],
        default: 'Draft',
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
}, {
    timestamps: true,
});

const GRN = mongoose.model('GRN', grnSchema);

module.exports = GRN;
