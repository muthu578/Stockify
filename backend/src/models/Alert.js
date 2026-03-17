const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    type: { type: String, enum: ['Low Stock', 'Order', 'System', 'Finance'], default: 'System' },
    priority: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Low' },
    isRead: { type: Boolean, default: false },
    link: { type: String },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Alert', alertSchema);
