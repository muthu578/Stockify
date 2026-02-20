const mongoose = require('mongoose');

const machineSchema = new mongoose.Schema({
    machineCode: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    type: { type: String, required: true },
    manufacturer: { type: String },
    capacity: { type: String },
    location: { type: String },
    status: { type: String, enum: ['Active', 'Maintenance', 'Idle', 'Decommissioned'], default: 'Active' },
    installDate: { type: Date },
    lastMaintenance: { type: Date },
    notes: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Machine', machineSchema);
