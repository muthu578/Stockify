const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
    purchaseId: {
        type: String,
        required: true,
        unique: true,
    },
    supplier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Contact',
        required: true,
    },
    items: [{
        item: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Item',
            required: true,
        },
        purchasePrice: {
            type: Number,
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
        },
        subtotal: {
            type: Number,
            required: true,
        }
    }],
    totalAmount: {
        type: Number,
        required: true,
    },
    paidAmount: {
        type: Number,
        default: 0,
    },
    status: {
        type: String,
        enum: ['Pending', 'Received', 'Cancelled'],
        default: 'Received',
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
}, {
    timestamps: true,
});

const Purchase = mongoose.model('Purchase', purchaseSchema);

module.exports = Purchase;
