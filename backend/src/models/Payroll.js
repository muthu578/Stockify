const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema({
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true,
    },
    month: {
        type: String,
        required: true,
    },
    year: {
        type: String,
        required: true,
    },
    basicSalary: {
        type: Number,
        required: true,
    },
    allowance: {
        type: Number,
        default: 0,
    },
    deduction: {
        type: Number,
        default: 0,
    },
    netSalary: {
        type: Number,
        required: true,
    },
    paymentDate: {
        type: Date,
        default: Date.now,
    },
    status: {
        type: String,
        enum: ['Paid', 'Pending'],
        default: 'Paid',
    }
}, {
    timestamps: true,
});

const Payroll = mongoose.model('Payroll', payrollSchema);

module.exports = Payroll;
