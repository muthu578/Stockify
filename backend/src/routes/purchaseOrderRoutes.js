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
const { protect, admin, manager } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, manager, getPurchaseOrders)
    .post(protect, manager, createPurchaseOrder);

router.route('/:id')
    .get(protect, manager, getPurchaseOrderById)
    .put(protect, manager, updatePurchaseOrder)
    .delete(protect, admin, deletePurchaseOrder);

router.route('/:id/status')
    .patch(protect, manager, updatePOStatus);

module.exports = router;
