const mongoose = require('mongoose');

const productionSchema = new mongoose.Schema({
    batchNumber: { type: String, required: true, unique: true },
    machine: { type: mongoose.Schema.Types.ObjectId, ref: 'Machine', required: true },
    item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
    itemName: { type: String, required: true },
    plannedQty: { type: Number, required: true },
    producedQty: { type: Number, default: 0 },
    rejectedQty: { type: Number, default: 0 },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    status: { type: String, enum: ['Planned', 'In Progress', 'Completed', 'Cancelled'], default: 'Planned' },
    notes: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Production', productionSchema);
