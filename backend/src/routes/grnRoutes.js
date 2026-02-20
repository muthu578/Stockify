const express = require('express');
const router = express.Router();
const {
    getGRNs,
    getGRNById,
    getPendingPOs,
    createGRN,
    updateGRNStatus,
} = require('../controllers/grnController');
const { protect, admin } = require('../middleware/authMiddleware');

// Must be before /:id to avoid conflict
router.route('/pending-pos')
    .get(protect, admin, getPendingPOs);

router.route('/')
    .get(protect, admin, getGRNs)
    .post(protect, admin, createGRN);

router.route('/:id')
    .get(protect, admin, getGRNById);

router.route('/:id/status')
    .patch(protect, admin, updateGRNStatus);

module.exports = router;
