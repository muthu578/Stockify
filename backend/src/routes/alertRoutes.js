const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alertController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, alertController.getAlerts);
router.post('/', protect, alertController.createAlert);
router.patch('/:id/read', protect, alertController.markAsRead);
router.delete('/:id', protect, alertController.deleteAlert);

module.exports = router;
