const express = require('express');
const router = express.Router();
const { getEmployees, createEmployee, getPayrolls, processSalary } = require('../controllers/hrController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/employees').get(protect, getEmployees).post(protect, admin, createEmployee);
router.route('/payroll').get(protect, getPayrolls).post(protect, admin, processSalary);

module.exports = router;
