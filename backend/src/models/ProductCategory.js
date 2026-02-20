const mongoose = require('mongoose');

const productCategorySchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    code: {
        type: String, // Optional short code
    },
    description: {
        type: String,
    },
}, {
    timestamps: true,
});

const ProductCategory = mongoose.model('ProductCategory', productCategorySchema);

module.exports = ProductCategory;
