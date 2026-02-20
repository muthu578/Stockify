const mongoose = require('mongoose');

const stockTransferSchema = new mongoose.Schema({
    transferNumber: { type: String, required: true, unique: true },
    fromLocation: { type: String, required: true },
    toLocation: { type: String, required: true },
    items: [{
        item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
        itemName: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        unit: { type: String, default: 'pcs' },
    }],
    reason: { type: String },
    status: { type: String, enum: ['Pending', 'In Transit', 'Completed', 'Cancelled'], default: 'Pending' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('StockTransfer', stockTransferSchema);
