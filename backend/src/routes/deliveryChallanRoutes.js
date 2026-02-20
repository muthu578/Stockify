const express = require('express');
const router = express.Router();
const { getDeliveryChallans, getDeliveryChallanById, createDeliveryChallan, updateChallanStatus, deleteDeliveryChallan } = require('../controllers/deliveryChallanController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').get(protect, getDeliveryChallans).post(protect, createDeliveryChallan);
router.route('/:id').get(protect, getDeliveryChallanById).delete(protect, deleteDeliveryChallan);
router.route('/:id/status').patch(protect, updateChallanStatus);

module.exports = router;
