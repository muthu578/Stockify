const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
    },
    phone: {
        type: String,
        required: true,
    },
    address: {
        type: String,
    },
    gstin: {
        type: String,
    },
    type: {
        type: String,
        enum: ['Customer', 'Supplier'],
        required: true,
    },
    balance: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true,
});

const Contact = mongoose.model('Contact', contactSchema);

module.exports = Contact;
