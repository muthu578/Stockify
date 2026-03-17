const Contact = require('../models/Contact');

// @desc    Get contacts
// @route   GET /api/contacts
// @access  Private
const getContacts = async (req, res) => {
    try {
        const pageSize = Math.max(1, parseInt(req.query.limit) || 10);
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const { type, search } = req.query;
        
        let query = {};
        if (type) query.type = type;

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
            ];
        }

        const count = await Contact.countDocuments(query);
        const contacts = await Contact.find(query)
            .sort({ name: 1 })
            .limit(pageSize)
            .skip(pageSize * (page - 1));

        res.json({
            contacts,
            page,
            pages: Math.ceil(count / pageSize),
            total: count
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create contact
// @route   POST /api/contacts
// @access  Private
const createContact = async (req, res) => {
    try {
        const { name, email, phone, address, type } = req.body;
        const contact = await Contact.create({
            name, email, phone, address, type
        });
        res.status(201).json(contact);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update contact
// @route   PUT /api/contacts/:id
// @access  Private
const updateContact = async (req, res) => {
    try {
        const contact = await Contact.findById(req.params.id);
        if (contact) {
            contact.name = req.body.name || contact.name;
            contact.email = req.body.email || contact.email;
            contact.phone = req.body.phone || contact.phone;
            contact.address = req.body.address || contact.address;
            const updatedContact = await contact.save();
            res.json(updatedContact);
        } else {
            res.status(404).json({ message: 'Contact not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete contact
// @route   DELETE /api/contacts/:id
// @access  Private/Admin
const deleteContact = async (req, res) => {
    try {
        const contact = await Contact.findById(req.params.id);
        if (contact) {
            await contact.deleteOne();
            res.json({ message: 'Contact removed' });
        } else {
            res.status(404).json({ message: 'Contact not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getContacts,
    createContact,
    updateContact,
    deleteContact
};
