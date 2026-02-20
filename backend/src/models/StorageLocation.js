const mongoose = require('mongoose');

const storageLocationSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    code: {
        type: String,
        required: true,
        unique: true,
    },
    description: {
        type: String,
    },
    capacity: {
        type: Number,
        default: 0
    },
}, {
    timestamps: true,
});

const StorageLocation = mongoose.model('StorageLocation', storageLocationSchema);

module.exports = StorageLocation;
