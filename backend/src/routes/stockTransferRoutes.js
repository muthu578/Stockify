const express = require('express');
const router = express.Router();
const { getStockTransfers, createStockTransfer, updateTransferStatus, deleteStockTransfer } = require('../controllers/stockTransferController');
const { protect, admin, manager } = require('../middleware/authMiddleware');

router.route('/').get(protect, getStockTransfers).post(protect, createStockTransfer);
router.route('/:id').delete(protect, admin, deleteStockTransfer);
router.route('/:id/status').patch(protect, manager, updateTransferStatus);

module.exports = router;
