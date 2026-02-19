const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('../models/User');

const seedData = async () => {
    try {
        const adminExists = await User.findOne({ role: 'Admin' });
        if (!adminExists) {
            await User.create({
                name: 'System Admin',
                username: 'admin',
                password: 'admin123',
                role: 'Admin'
            });
            console.log('👤 Default Admin Created: admin / admin123');

            // Seed some items
            const Item = require('../models/Item');
            const items = await Item.countDocuments();
            if (items === 0) {
                await Item.create([
                    { name: 'Basmati Rice 5kg', category: 'Grocery', price: 15, buyPrice: 11, stock: 40, unit: 'pcs' },
                    { name: 'Wheat Flour 5kg', category: 'Grocery', price: 12, buyPrice: 8, stock: 60, unit: 'pcs' },
                    { name: 'Sugar 2kg', category: 'Grocery', price: 6, buyPrice: 4, stock: 80, unit: 'pcs' },
                    { name: 'Salt 1kg', category: 'Grocery', price: 2, buyPrice: 1, stock: 100, unit: 'pcs' },
                    { name: 'Chickpeas 1kg', category: 'Grocery', price: 5, buyPrice: 3, stock: 70, unit: 'pcs' },
                    { name: 'Kidney Beans 1kg', category: 'Grocery', price: 6, buyPrice: 3.5, stock: 50, unit: 'pcs' },
                    { name: 'Red Lentils 1kg', category: 'Grocery', price: 4.5, buyPrice: 2.8, stock: 90, unit: 'pcs' },
                    { name: 'Cooking Oil 1L', category: 'Grocery', price: 5.5, buyPrice: 3.5, stock: 120, unit: 'pcs' },
                    { name: 'Spices Pack', category: 'Grocery', price: 3.5, buyPrice: 2, stock: 75, unit: 'pcs' },
                    { name: 'Corn Flour 1kg', category: 'Grocery', price: 4, buyPrice: 2.5, stock: 65, unit: 'pcs' },
                    { name: 'Organic Milk 1L', category: 'Dairy', price: 4.5, buyPrice: 3.2, stock: 50, unit: 'pcs' },
                    { name: 'Cheese 200g', category: 'Dairy', price: 4, buyPrice: 2.5, stock: 40, unit: 'pcs' },
                    { name: 'Butter 250g', category: 'Dairy', price: 5, buyPrice: 3, stock: 35, unit: 'pcs' },
                    { name: 'Yogurt 500g', category: 'Dairy', price: 3.5, buyPrice: 2, stock: 45, unit: 'pcs' },
                    { name: 'Paneer 200g', category: 'Dairy', price: 4.2, buyPrice: 2.8, stock: 30, unit: 'pcs' },
                    { name: 'Cream 200ml', category: 'Dairy', price: 4, buyPrice: 2.5, stock: 25, unit: 'pcs' },
                    { name: 'Ghee 500g', category: 'Dairy', price: 8, buyPrice: 5, stock: 20, unit: 'pcs' },
                    { name: 'Flavored Milk 200ml', category: 'Dairy', price: 2, buyPrice: 1.2, stock: 60, unit: 'pcs' },
                    { name: 'Curd 1kg', category: 'Dairy', price: 4.5, buyPrice: 2.8, stock: 40, unit: 'pcs' },
                    { name: 'Milk Powder 500g', category: 'Dairy', price: 6.5, buyPrice: 4, stock: 30, unit: 'pcs' },
                    { name: 'Whole Grain Bread', category: 'Bakery', price: 3.2, buyPrice: 2.1, stock: 30, unit: 'pcs' },
                    { name: 'Croissant', category: 'Bakery', price: 2, buyPrice: 1.2, stock: 25, unit: 'pcs' },
                    { name: 'Muffins Pack', category: 'Bakery', price: 2.5, buyPrice: 1.5, stock: 20, unit: 'pcs' },
                    { name: 'Brown Bread', category: 'Bakery', price: 3, buyPrice: 2, stock: 40, unit: 'pcs' },
                    { name: 'Garlic Bread', category: 'Bakery', price: 4, buyPrice: 2.5, stock: 15, unit: 'pcs' },
                    { name: 'Cake Slice', category: 'Bakery', price: 5, buyPrice: 2.8, stock: 25, unit: 'pcs' },
                    { name: 'Cookies Pack', category: 'Bakery', price: 2.8, buyPrice: 1.5, stock: 50, unit: 'pcs' },
                    { name: 'Donut', category: 'Bakery', price: 2.2, buyPrice: 1.2, stock: 30, unit: 'pcs' },
                    { name: 'Pastry', category: 'Bakery', price: 3.5, buyPrice: 2, stock: 20, unit: 'pcs' },
                    { name: 'Bagel', category: 'Bakery', price: 3, buyPrice: 1.8, stock: 25, unit: 'pcs' },
                    { name: 'Coca Cola 1L', category: 'Beverages', price: 2, buyPrice: 1.2, stock: 100, unit: 'pcs' },
                    { name: 'Pepsi 500ml', category: 'Beverages', price: 1.6, buyPrice: 0.9, stock: 120, unit: 'pcs' },
                    { name: 'Orange Juice 1L', category: 'Beverages', price: 4.5, buyPrice: 2.8, stock: 50, unit: 'pcs' },
                    { name: 'Green Tea Pack', category: 'Beverages', price: 5, buyPrice: 3, stock: 30, unit: 'pcs' },
                    { name: 'Coffee Powder 200g', category: 'Beverages', price: 6.5, buyPrice: 4, stock: 25, unit: 'pcs' },
                    { name: 'Energy Drink 250ml', category: 'Beverages', price: 2.5, buyPrice: 1.5, stock: 80, unit: 'pcs' },
                    { name: 'Mineral Water 1L', category: 'Beverages', price: 1, buyPrice: 0.5, stock: 200, unit: 'pcs' },
                    { name: 'Apple Juice 1L', category: 'Beverages', price: 4, buyPrice: 2.5, stock: 40, unit: 'pcs' },
                    { name: 'Iced Tea 500ml', category: 'Beverages', price: 3, buyPrice: 1.8, stock: 60, unit: 'pcs' },
                    { name: 'Hot Chocolate Mix', category: 'Beverages', price: 6, buyPrice: 3.5, stock: 25, unit: 'pcs' },
                    { name: 'Dove Shampoo', category: 'Personal Care', price: 8.5, buyPrice: 6, stock: 5, unit: 'pcs' },
                    { name: 'Colgate Toothpaste', category: 'Personal Care', price: 3, buyPrice: 1.5, stock: 70, unit: 'pcs' },
                    { name: 'Lifebuoy Soap', category: 'Personal Care', price: 1.5, buyPrice: 0.8, stock: 150, unit: 'pcs' },
                    { name: 'Sunsilk Conditioner', category: 'Personal Care', price: 6.5, buyPrice: 4, stock: 40, unit: 'pcs' },
                    { name: 'Dettol Handwash', category: 'Personal Care', price: 4, buyPrice: 2.5, stock: 60, unit: 'pcs' },
                    { name: 'Face Cream', category: 'Personal Care', price: 6, buyPrice: 3.5, stock: 30, unit: 'pcs' },
                    { name: 'Hair Oil 200ml', category: 'Personal Care', price: 4.5, buyPrice: 2.8, stock: 50, unit: 'pcs' },
                    { name: 'Shaving Foam', category: 'Personal Care', price: 5, buyPrice: 3, stock: 20, unit: 'pcs' },
                    { name: 'Body Lotion 500ml', category: 'Personal Care', price: 7, buyPrice: 4.5, stock: 25, unit: 'pcs' },
                    { name: 'Toothbrush Pack', category: 'Personal Care', price: 2, buyPrice: 1, stock: 100, unit: 'pcs' },
                    { name: 'Detergent Powder 1kg', category: 'Household', price: 6, buyPrice: 3.5, stock: 45, unit: 'pcs' },
                    { name: 'Dishwashing Liquid', category: 'Household', price: 3.5, buyPrice: 2, stock: 60, unit: 'pcs' },
                    { name: 'Floor Cleaner', category: 'Household', price: 4.5, buyPrice: 2.5, stock: 40, unit: 'pcs' },
                    { name: 'Toilet Cleaner', category: 'Household', price: 5, buyPrice: 3, stock: 35, unit: 'pcs' },
                    { name: 'Tissue Roll', category: 'Household', price: 2, buyPrice: 1, stock: 80, unit: 'pcs' },
                    { name: 'Garbage Bags Pack', category: 'Household', price: 3.5, buyPrice: 2, stock: 50, unit: 'pcs' },
                    { name: 'Air Freshener', category: 'Household', price: 4, buyPrice: 2.5, stock: 30, unit: 'pcs' },
                    { name: 'Mop Set', category: 'Household', price: 8, buyPrice: 5, stock: 20, unit: 'pcs' },
                    { name: 'Laundry Liquid', category: 'Household', price: 6.5, buyPrice: 3.8, stock: 40, unit: 'pcs' },
                    { name: 'Hand Gloves', category: 'Household', price: 2.5, buyPrice: 1.5, stock: 60, unit: 'pcs' },
                    { name: 'Potato Chips 200g', category: 'Snacks', price: 1.8, buyPrice: 1, stock: 100, unit: 'pcs' },
                    { name: 'Nachos Pack', category: 'Snacks', price: 2, buyPrice: 1.2, stock: 80, unit: 'pcs' },
                    { name: 'Popcorn Pack', category: 'Snacks', price: 2.5, buyPrice: 1.5, stock: 70, unit: 'pcs' },
                    { name: 'Biscuits Pack', category: 'Snacks', price: 1.8, buyPrice: 1, stock: 120, unit: 'pcs' },
                    { name: 'Chocolate Bar', category: 'Snacks', price: 2.5, buyPrice: 1.5, stock: 90, unit: 'pcs' },
                    { name: 'Candy Pack', category: 'Snacks', price: 1, buyPrice: 0.5, stock: 200, unit: 'pcs' },
                    { name: 'Dry Fruits Mix', category: 'Snacks', price: 6.5, buyPrice: 4, stock: 40, unit: 'pcs' },
                    { name: 'Protein Bar', category: 'Snacks', price: 3.5, buyPrice: 2, stock: 50, unit: 'pcs' },
                    { name: 'Nuts Pack', category: 'Snacks', price: 6, buyPrice: 3.5, stock: 30, unit: 'pcs' },
                    { name: 'Ice Cream Cup', category: 'Snacks', price: 2.2, buyPrice: 1.2, stock: 60, unit: 'pcs' },
                    { name: 'Frozen Peas 500g', category: 'Frozen Foods', price: 3.5, buyPrice: 2, stock: 30, unit: 'pcs' },
                    { name: 'French Fries 1kg', category: 'Frozen Foods', price: 6, buyPrice: 3.5, stock: 40, unit: 'pcs' },
                    { name: 'Chicken Nuggets', category: 'Frozen Foods', price: 7, buyPrice: 4, stock: 25, unit: 'pcs' },
                    { name: 'Fish Fillets', category: 'Frozen Foods', price: 8.5, buyPrice: 5, stock: 20, unit: 'pcs' },
                    { name: 'Ice Cream Tub', category: 'Frozen Foods', price: 10, buyPrice: 6, stock: 15, unit: 'pcs' },
                    { name: 'Frozen Corn 500g', category: 'Frozen Foods', price: 3.8, buyPrice: 2.2, stock: 35, unit: 'pcs' },
                    { name: 'Frozen Spinach', category: 'Frozen Foods', price: 4.5, buyPrice: 2.5, stock: 30, unit: 'pcs' },
                    { name: 'Frozen Pizza', category: 'Frozen Foods', price: 7.5, buyPrice: 4.5, stock: 20, unit: 'pcs' },
                    { name: 'Frozen Berries', category: 'Frozen Foods', price: 8, buyPrice: 5, stock: 25, unit: 'pcs' },
                    { name: 'Frozen Dumplings', category: 'Frozen Foods', price: 6, buyPrice: 3.5, stock: 30, unit: 'pcs' },
                    { name: 'Apples 1kg', category: 'Fruits', price: 4, buyPrice: 2.5, stock: 60, unit: 'pcs' },
                    { name: 'Bananas 1kg', category: 'Fruits', price: 2, buyPrice: 1.2, stock: 80, unit: 'pcs' },
                    { name: 'Oranges 1kg', category: 'Fruits', price: 3.5, buyPrice: 2, stock: 70, unit: 'pcs' },
                    { name: 'Grapes 500g', category: 'Fruits', price: 4, buyPrice: 2.5, stock: 50, unit: 'pcs' },
                    { name: 'Mangoes 1kg', category: 'Fruits', price: 5, buyPrice: 3, stock: 40, unit: 'pcs' },
                    { name: 'Pineapple', category: 'Fruits', price: 4.5, buyPrice: 2.8, stock: 30, unit: 'pcs' },
                    { name: 'Papaya', category: 'Fruits', price: 3.8, buyPrice: 2.2, stock: 35, unit: 'pcs' },
                    { name: 'Watermelon', category: 'Fruits', price: 6, buyPrice: 3.5, stock: 20, unit: 'pcs' },
                    { name: 'Strawberries 500g', category: 'Fruits', price: 6.5, buyPrice: 4, stock: 25, unit: 'pcs' },
                    { name: 'Kiwi Pack', category: 'Fruits', price: 6, buyPrice: 3.5, stock: 30, unit: 'pcs' },
                    { name: 'Tomatoes 1kg', category: 'Vegetables', price: 2, buyPrice: 1.2, stock: 90, unit: 'pcs' },
                    { name: 'Potatoes 1kg', category: 'Vegetables', price: 1.8, buyPrice: 1, stock: 100, unit: 'pcs' },
                    { name: 'Onions 1kg', category: 'Vegetables', price: 2, buyPrice: 1.1, stock: 85, unit: 'pcs' },
                    { name: 'Carrots 1kg', category: 'Vegetables', price: 2.2, buyPrice: 1.3, stock: 70, unit: 'pcs' },
                    { name: 'Spinach Bunch', category: 'Vegetables', price: 1.5, buyPrice: 0.8, stock: 60, unit: 'pcs' },
                    { name: 'Cabbage', category: 'Vegetables', price: 2.5, buyPrice: 1.5, stock: 50, unit: 'pcs' },
                    { name: 'Cauliflower', category: 'Vegetables', price: 3, buyPrice: 1.8, stock: 40, unit: 'pcs' },
                    { name: 'Green Beans 500g', category: 'Vegetables', price: 2.5, buyPrice: 1.5, stock: 45, unit: 'pcs' },
                    { name: 'Bell Peppers 500g', category: 'Vegetables', price: 3.5, buyPrice: 2, stock: 40, unit: 'pcs' },
                ]);
                console.log('📦 Sample Inventory Seeded');
            }

            // Seed a customer
            const Contact = require('../models/Contact');
            const contacts = await Contact.countDocuments();
            if (contacts === 0) {
                await Contact.create([
                    { name: 'Walk-in Customer', type: 'Customer', phone: '0000000000', balance: 0 },
                    { name: 'Global Foods Inc', type: 'Supplier', phone: '1234567890', balance: 0 },
                ]);
                console.log('👥 Sample Contacts Seeded');
            }
        }
    } catch (error) {
        console.error('Error seeding data:', error);
    }
};

const seedAdmin = seedData;

const connectDB = async () => {
    try {
        let dbUri = process.env.MONGO_URI;

        if (process.env.USE_MEMORY_DB === 'true') {
            const mongoServer = await MongoMemoryServer.create();
            dbUri = mongoServer.getUri();
            console.log('🚀 Using In-Memory MongoDB for zero-setup demo!');
        }

        const conn = await mongoose.connect(dbUri || 'mongodb://127.0.0.1:27017/supermarket');
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

        // Seed admin user
        await seedAdmin();
    } catch (error) {
        console.error(`❌ Error Message: ${error.message}`);

        if (error.message.includes('ECONNREFUSED')) {
            console.log('⚠️ Local MongoDB not found. Auto-starting In-Memory DB...');
            const mongoServer = await MongoMemoryServer.create();
            const conn = await mongoose.connect(mongoServer.getUri());
            console.log(`🚀 In-Memory MongoDB Started: ${conn.connection.host}`);
            await seedAdmin();
            return;
        }

        process.exit(1);
    }
};

module.exports = connectDB;
