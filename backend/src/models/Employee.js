const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
    employeeId: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
    },
    designation: {
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
    salary: {
        type: Number,
        required: true,
    },
    joiningDate: {
        type: Date,
        default: Date.now,
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Active',
    }
}, {
    timestamps: true,
});

const Employee = mongoose.model('Employee', employeeSchema);

module.exports = Employee;
