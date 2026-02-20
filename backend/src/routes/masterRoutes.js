const express = require('express');
const router = express.Router();
const {
    getStorageLocations,
    createStorageLocation,
    updateStorageLocation,
    deleteStorageLocation,
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
} = require('../controllers/masterController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/storage-locations')
    .get(protect, getStorageLocations)
    .post(protect, admin, createStorageLocation);

router.route('/storage-locations/:id')
    .put(protect, admin, updateStorageLocation)
    .delete(protect, admin, deleteStorageLocation);

router.route('/categories')
    .get(protect, getCategories)
    .post(protect, admin, createCategory);

router.route('/categories/:id')
    .put(protect, admin, updateCategory)
    .delete(protect, admin, deleteCategory);

module.exports = router;
