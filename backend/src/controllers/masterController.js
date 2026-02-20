const asyncHandler = require('express-async-handler');
const StorageLocation = require('../models/StorageLocation');
const ProductCategory = require('../models/ProductCategory');

// @desc    Get all storage locations
// @route   GET /api/masters/storage-locations
// @access  Private/Admin
const getStorageLocations = asyncHandler(async (req, res) => {
    const locations = await StorageLocation.find({});
    res.json(locations);
});

// @desc    Create a storage location
// @route   POST /api/masters/storage-locations
// @access  Private/Admin
const createStorageLocation = asyncHandler(async (req, res) => {
    const { name, code, description, capacity } = req.body;

    const exists = await StorageLocation.findOne({ code });
    if (exists) {
        res.status(400);
        throw new Error('Location code already exists');
    }

    const location = await StorageLocation.create({
        name,
        code,
        description,
        capacity,
    });

    res.status(201).json(location);
});

// @desc    Update a storage location
// @route   PUT /api/masters/storage-locations/:id
// @access  Private/Admin
const updateStorageLocation = asyncHandler(async (req, res) => {
    const location = await StorageLocation.findById(req.params.id);

    if (location) {
        location.name = req.body.name || location.name;
        location.code = req.body.code || location.code;
        location.description = req.body.description || location.description;
        location.capacity = req.body.capacity || location.capacity;

        const updatedLocation = await location.save();
        res.json(updatedLocation);
    } else {
        res.status(404);
        throw new Error('Location not found');
    }
});

// @desc    Delete a storage location
// @route   DELETE /api/masters/storage-locations/:id
// @access  Private/Admin
const deleteStorageLocation = asyncHandler(async (req, res) => {
    const location = await StorageLocation.findById(req.params.id);

    if (location) {
        await location.deleteOne();
        res.json({ message: 'Location removed' });
    } else {
        res.status(404);
        throw new Error('Location not found');
    }
});


// @desc    Get all categories
// @route   GET /api/masters/categories
// @access  Private/Admin
const getCategories = asyncHandler(async (req, res) => {
    const categories = await ProductCategory.find({});
    res.json(categories);
});

// @desc    Create a category
// @route   POST /api/masters/categories
// @access  Private/Admin
const createCategory = asyncHandler(async (req, res) => {
    const { name, code, description } = req.body;

    const exists = await ProductCategory.findOne({ name });
    if (exists) {
        res.status(400);
        throw new Error('Category already exists');
    }

    const category = await ProductCategory.create({
        name,
        code,
        description,
    });

    res.status(201).json(category);
});

// @desc    Update a category
// @route   PUT /api/masters/categories/:id
// @access  Private/Admin
const updateCategory = asyncHandler(async (req, res) => {
    const category = await ProductCategory.findById(req.params.id);

    if (category) {
        category.name = req.body.name || category.name;
        category.code = req.body.code || category.code;
        category.description = req.body.description || category.description;

        const updatedCategory = await category.save();
        res.json(updatedCategory);
    } else {
        res.status(404);
        throw new Error('Category not found');
    }
});

// @desc    Delete a category
// @route   DELETE /api/masters/categories/:id
// @access  Private/Admin
const deleteCategory = asyncHandler(async (req, res) => {
    const category = await ProductCategory.findById(req.params.id);

    if (category) {
        await category.deleteOne();
        res.json({ message: 'Category removed' });
    } else {
        res.status(404);
        throw new Error('Category not found');
    }
});

module.exports = {
    getStorageLocations,
    createStorageLocation,
    updateStorageLocation,
    deleteStorageLocation,
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
};
