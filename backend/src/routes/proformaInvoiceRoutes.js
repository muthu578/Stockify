const express = require('express');
const router = express.Router();
const { getProformaInvoices, getProformaInvoiceById, createProformaInvoice, updateProformaStatus, deleteProformaInvoice } = require('../controllers/proformaInvoiceController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').get(protect, getProformaInvoices).post(protect, createProformaInvoice);
router.route('/:id').get(protect, getProformaInvoiceById).delete(protect, deleteProformaInvoice);
router.route('/:id/status').patch(protect, updateProformaStatus);

module.exports = router;
