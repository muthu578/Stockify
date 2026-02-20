const express = require('express');
const router = express.Router();
const {
    getPurchaseOrders,
    getPurchaseOrderById,
    createPurchaseOrder,
    updatePurchaseOrder,
    updatePOStatus,
    deletePurchaseOrder,
} = require('../controllers/purchaseOrderController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, admin, getPurchaseOrders)
    .post(protect, admin, createPurchaseOrder);

router.route('/:id')
    .get(protect, admin, getPurchaseOrderById)
    .put(protect, admin, updatePurchaseOrder)
    .delete(protect, admin, deletePurchaseOrder);

router.route('/:id/status')
    .patch(protect, admin, updatePOStatus);

module.exports = router;
