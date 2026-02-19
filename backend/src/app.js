const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const itemRoutes = require('./routes/itemRoutes');
const billingRoutes = require('./routes/billingRoutes');
const reportRoutes = require('./routes/reportRoutes');
const userRoutes = require('./routes/userRoutes');
const contactRoutes = require('./routes/contactRoutes');
const purchaseRoutes = require('./routes/purchaseRoutes');
const financeRoutes = require('./routes/financeRoutes');
const hrRoutes = require('./routes/hrRoutes');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/users', userRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/hr', hrRoutes);

app.get('/', (req, res) => {
    res.send('API is running...');
});

module.exports = app;
