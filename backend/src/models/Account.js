const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
    accountName: {
        type: String,
        required: true,
        unique: true,
    },
    accountNumber: {
        type: String,
    },
    bankName: {
        type: String,
    },
    balance: {
        type: Number,
        default: 0,
    },
    type: {
        type: String,
        enum: ['Cash', 'Bank'],
        default: 'Bank',
    }
}, {
    timestamps: true,
});

const Account = mongoose.model('Account', accountSchema);

module.exports = Account;
