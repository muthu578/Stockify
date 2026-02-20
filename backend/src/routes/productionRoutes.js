const express = require('express');
const router = express.Router();
const { getProductions, createProduction, updateProduction, deleteProduction } = require('../controllers/productionController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').get(protect, admin, getProductions).post(protect, admin, createProduction);
router.route('/:id').put(protect, admin, updateProduction).delete(protect, admin, deleteProduction);

module.exports = router;
