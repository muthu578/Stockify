const express = require('express');
const router = express.Router();
const multer = require('multer');
const os = require('os');
const uploadTarget = process.env.VERCEL ? os.tmpdir() : 'uploads/';
const upload = multer({ dest: uploadTarget });
const { getItems, getItemById, createItem, updateItem, deleteItem, bulkUploadItems } = require('../controllers/itemController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getItems)
    .post(protect, admin, createItem);

router.post('/bulk-upload', protect, admin, upload.single('file'), bulkUploadItems);

router.route('/:id')
    .get(protect, getItemById)
    .put(protect, admin, updateItem)
    .delete(protect, admin, deleteItem);

module.exports = router;
