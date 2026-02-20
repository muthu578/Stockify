const express = require('express');
const router = express.Router();
const { getMachines, getMachineById, createMachine, updateMachine, deleteMachine } = require('../controllers/machineController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').get(protect, admin, getMachines).post(protect, admin, createMachine);
router.route('/:id').get(protect, admin, getMachineById).put(protect, admin, updateMachine).delete(protect, admin, deleteMachine);

module.exports = router;
