const mongoose = require('mongoose');

const deliveryChallanSchema = new mongoose.Schema({
    challanNumber: { type: String, required: true, unique: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact', required: true },
    items: [{
        item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
        itemName: { type: String, required: true },
        quantity: { type: Number, required: true },
        unit: { type: String, default: 'pcs' },
    }],
    vehicleNumber: { type: String },
    driverName: { type: String },
    transportMode: { type: String, enum: ['Road', 'Rail', 'Air', 'Courier'], default: 'Road' },
    dispatchDate: { type: Date, default: Date.now },
    deliveryDate: { type: Date },
    notes: { type: String },
    status: { type: String, enum: ['Draft', 'Dispatched', 'Delivered', 'Cancelled'], default: 'Draft' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('DeliveryChallan', deliveryChallanSchema);
