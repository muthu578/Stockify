const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
    billId: {
        type: String,
        required: true,
        unique: true,
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Contact',
    },
    items: [{
        item: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Item',
            required: true,
        },
        name: String,
        price: Number,
        quantity: Number,
        subtotal: Number,
    }],
    totalAmount: {
        type: Number,
        required: true,
    },
    discount: {
        type: Number,
        default: 0,
    },
    tax: {
        type: Number,
        default: 0,
    },
    finalAmount: {
        type: Number,
        required: true,
    },
    cashier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    paymentMethod: {
        type: String,
        enum: ['Cash', 'Card', 'UPI'],
        default: 'Cash',
    },
}, {
    timestamps: true,
});

const Bill = mongoose.model('Bill', billSchema);

module.exports = Bill;
