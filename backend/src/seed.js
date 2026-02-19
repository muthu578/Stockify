const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Item = require('./models/Item');
const Bill = require('./models/Bill');

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/supermarket');
        console.log('MongoDB Connected for seeding...');
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const items = [
    { name: 'Red Bull Energy Drink', barcode: '90024901', category: 'Beverages', price: 2.5, stock: 50, unit: 'can' },
    { name: 'Coca-Cola 500ml', barcode: '54490001', category: 'Beverages', price: 1.2, stock: 100, unit: 'bottle' },
    { name: 'Lay\'s Classic Chips', barcode: '02840001', category: 'Snacks', price: 1.5, stock: 8, unit: 'packet' },
    { name: 'Basmati Rice 5kg', barcode: '89012341', category: 'Grocery', price: 12.0, stock: 25, unit: 'bag' },
    { name: 'Milk 1L', barcode: '76130301', category: 'Dairy', price: 0.95, stock: 40, unit: 'carton' },
    { name: 'Colgate Toothpaste', barcode: '03500001', category: 'Personal Care', price: 3.5, stock: 30, unit: 'pcs' },
    { name: 'Head & Shoulders Shampoo', barcode: '03700001', category: 'Personal Care', price: 5.5, stock: 15, unit: 'pcs' },
    { name: 'Amul Butter 500g', barcode: '89012621', category: 'Dairy', price: 4.2, stock: 5, unit: 'pcs' },
];

const seedData = async () => {
    try {
        await connectDB();

        // Clear existing data
        await User.deleteMany();
        await Item.deleteMany();
        await Bill.deleteMany();

        console.log('Existing data cleared.');

        // Seed Users
        const admin = await User.create({
            name: 'System Admin',
            username: 'admin',
            password: 'admin123',
            role: 'Admin'
        });

        const cashier = await User.create({
            name: 'John Doe',
            username: 'cashier',
            password: 'cashier123',
            role: 'Cashier'
        });

        console.log('Users seeded: admin/admin123, cashier/cashier123');

        // Seed Items
        await Item.insertMany(items);
        console.log('Items seeded.');

        console.log('Seeding completed successfully!');
        process.exit();
    } catch (error) {
        console.error(`Error with seeding: ${error.message}`);
        process.exit(1);
    }
};

seedData();
