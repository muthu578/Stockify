const Alert = require('../models/Alert');

exports.getAlerts = async (req, res) => {
    try {
        const alerts = await Alert.find().sort({ createdAt: -1 });
        res.json(alerts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createAlert = async (req, res) => {
    try {
        const alert = new Alert(req.body);
        await alert.save();
        res.status(201).json(alert);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        const alert = await Alert.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
        res.json(alert);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.deleteAlert = async (req, res) => {
    try {
        await Alert.findByIdAndDelete(req.params.id);
        res.json({ message: 'Alert deleted' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
