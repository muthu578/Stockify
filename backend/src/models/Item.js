const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    barcode: {
        type: String,
        unique: true,
        sparse: true,
    },
    category: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    buyPrice: {
        type: Number,
        default: 0,
    },
    stock: {
        type: Number,
        required: true,
        default: 0,
    },
    expiryDate: {
        type: Date,
    },
    unit: {
        type: String,
        default: 'pcs',
    }
}, {
    timestamps: true,
});

const Item = mongoose.model('Item', itemSchema);

module.exports = Item;
