const Employee = require('../models/Employee');
const Payroll = require('../models/Payroll');

// @desc    Get all employees
const getEmployees = async (req, res) => {
    try {
        const employees = await Employee.find({});
        res.json(employees);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create employee
const createEmployee = async (req, res) => {
    try {
        const employee = await Employee.create(req.body);
        res.status(201).json(employee);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get payroll records
const getPayrolls = async (req, res) => {
    try {
        const payrolls = await Payroll.find({}).populate('employee', 'name employeeId designation');
        res.json(payrolls);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Process Salary
const processSalary = async (req, res) => {
    try {
        const { employee: employeeId, month, year, allowance, deduction } = req.body;

        const employee = await Employee.findById(employeeId);
        if (!employee) return res.status(404).json({ message: 'Employee not found' });

        const netSalary = employee.salary + (allowance || 0) - (deduction || 0);

        const payroll = await Payroll.create({
            employee: employeeId,
            month,
            year,
            basicSalary: employee.salary,
            allowance,
            deduction,
            netSalary,
            status: 'Paid'
        });

        res.status(201).json(payroll);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    getEmployees,
    createEmployee,
    getPayrolls,
    processSalary
};
