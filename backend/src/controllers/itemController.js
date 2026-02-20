const Item = require('../models/Item');

// @desc    Get all items
// @route   GET /api/items
// @access  Private
const getItems = async (req, res) => {
    try {
        const { category, lowStock } = req.query;
        let query = {};

        if (category && category !== 'All') {
            query.category = category;
        }

        if (lowStock === 'true') {
            query.stock = { $lt: 10 };
        }

        const items = await Item.find(query).sort({ createdAt: -1 });
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single item
// @route   GET /api/items/:id
// @access  Private
const getItemById = async (req, res) => {
    const item = await Item.findById(req.params.id);

    if (item) {
        res.json(item);
    } else {
        res.status(404).json({ message: 'Item not found' });
    }
};

// @desc    Create an item
// @route   POST /api/items
// @access  Private/Admin
const createItem = async (req, res) => {
    const { name, barcode, category, price, buyPrice, stock, minStockLevel, brand, hsnCode, expiryDate, unit } = req.body;

    const item = new Item({
        name,
        barcode,
        category,
        price,
        buyPrice: buyPrice || 0,
        stock,
        minStockLevel: minStockLevel || 10,
        brand,
        hsnCode,
        expiryDate,
        unit,
    });

    const createdItem = await item.save();
    res.status(201).json(createdItem);
};

// @desc    Update an item
// @route   PUT /api/items/:id
// @access  Private/Admin
const updateItem = async (req, res) => {
    const { name, barcode, category, price, buyPrice, stock, minStockLevel, brand, hsnCode, expiryDate, unit } = req.body;

    const item = await Item.findById(req.params.id);

    if (item) {
        item.name = name || item.name;
        item.barcode = barcode || item.barcode;
        item.category = category || item.category;
        item.price = price !== undefined ? price : item.price;
        item.buyPrice = buyPrice !== undefined ? buyPrice : item.buyPrice;
        item.stock = stock !== undefined ? stock : item.stock;
        item.minStockLevel = minStockLevel !== undefined ? minStockLevel : item.minStockLevel;
        item.brand = brand || item.brand;
        item.hsnCode = hsnCode || item.hsnCode;
        item.expiryDate = expiryDate || item.expiryDate;
        item.unit = unit || item.unit;

        const updatedItem = await item.save();
        res.json(updatedItem);
    } else {
        res.status(404).json({ message: 'Item not found' });
    }
};

// @desc    Delete an item
// @route   DELETE /api/items/:id
// @access  Private/Admin
const deleteItem = async (req, res) => {
    const item = await Item.findById(req.params.id);

    if (item) {
        await item.deleteOne();
        res.json({ message: 'Item removed' });
    } else {
        res.status(404).json({ message: 'Item not found' });
    }
};

// @desc    Bulk upload items via CSV
// @route   POST /api/items/bulk-upload
// @access  Private/Admin
const bulkUploadItems = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload a CSV file' });
        }

        const items = [];
        const fs = require('fs');
        const csv = require('csv-parser');

        fs.createReadStream(req.file.path)
            .pipe(csv())
            .on('data', (row) => {
                items.push({
                    name: row.name,
                    barcode: row.barcode,
                    category: row.category,
                    brand: row.brand,
                    hsnCode: row.hsnCode,
                    price: parseFloat(row.price || 0),
                    buyPrice: parseFloat(row.buyPrice || 0),
                    stock: parseInt(row.stock || 0),
                    minStockLevel: parseInt(row.minStockLevel || 10),
                    unit: row.unit || 'pcs'
                });
            })
            .on('end', async () => {
                try {
                    await Item.insertMany(items);
                    if (fs.existsSync(req.file.path)) {
                        fs.unlinkSync(req.file.path); // Delete temp file
                    }
                    res.status(201).json({ message: `${items.length} items uploaded successfully` });
                } catch (err) {
                    res.status(400).json({ message: 'Error inserting data', error: err.message });
                }
            });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getItems, getItemById, createItem, updateItem, deleteItem, bulkUploadItems };
