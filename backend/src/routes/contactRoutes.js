const express = require('express');
const router = express.Router();
const { getContacts, createContact, updateContact, deleteContact } = require('../controllers/contactController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getContacts)
    .post(protect, createContact);

router.route('/:id')
    .put(protect, updateContact)
    .delete(protect, admin, deleteContact);

module.exports = router;
