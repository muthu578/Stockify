const express = require('express');
const router = express.Router();
const { loginUser, registerUser, getUserProfile } = require('../controllers/authController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/login', loginUser);
router.post('/register', protect, admin, registerUser);
router.get('/me', protect, getUserProfile);

module.exports = router;
