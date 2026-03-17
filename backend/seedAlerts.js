const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Alert = require('./src/models/Alert');

dotenv.config();

const seedAlerts = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const alerts = [
            {
                title: 'Low Stock: Tomato (Hybrid)',
                description: 'Stock level dropped to 8 units. Minimum threshold is 10.',
                type: 'Low Stock',
                priority: 'High',
                link: '/inventory/product-master?search=Tomato'
            },
            {
                title: 'New Bulk Order Received',
                description: 'Order #ORD-2026-001 placed by Reliance Retail.',
                type: 'Order',
                priority: 'Medium'
            },
            {
                title: 'System Backup Successful',
                description: 'All nodes synchronized with cloud vault at 04:00 AM.',
                type: 'System',
                priority: 'Low'
            }
        ];

        await Alert.deleteMany();
        await Alert.insertMany(alerts);
        console.log('Alerts seeded successfully');
        process.exit();
    } catch (error) {
        console.error('Seeding failed', error);
        process.exit(1);
    }
};

seedAlerts();
