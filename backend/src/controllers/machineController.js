const Machine = require('../models/Machine');

const generateMachineCode = async () => {
    const last = await Machine.findOne().sort({ machineCode: -1 });
    if (last) {
        const num = parseInt(last.machineCode.replace('MC-', ''));
        return `MC-${String(num + 1).padStart(4, '0')}`;
    }
    return 'MC-0001';
};

const getMachines = async (req, res) => {
    try {
        const { status } = req.query;
        const filter = {};
        if (status && status !== 'All') filter.status = status;
        const machines = await Machine.find(filter).sort({ createdAt: -1 });
        res.json(machines);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

const getMachineById = async (req, res) => {
    try {
        const machine = await Machine.findById(req.params.id);
        if (!machine) return res.status(404).json({ message: 'Machine not found' });
        res.json(machine);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

const createMachine = async (req, res) => {
    try {
        const { name, type, manufacturer, capacity, location, installDate, notes } = req.body;
        if (!name || !type) return res.status(400).json({ message: 'Name and type are required' });
        const machineCode = await generateMachineCode();
        const machine = await new Machine({ machineCode, name, type, manufacturer, capacity, location, installDate, notes }).save();
        res.status(201).json(machine);
    } catch (error) { res.status(400).json({ message: error.message }); }
};

const updateMachine = async (req, res) => {
    try {
        const machine = await Machine.findById(req.params.id);
        if (!machine) return res.status(404).json({ message: 'Machine not found' });
        const { name, type, manufacturer, capacity, location, status, installDate, lastMaintenance, notes } = req.body;
        if (name) machine.name = name;
        if (type) machine.type = type;
        if (manufacturer !== undefined) machine.manufacturer = manufacturer;
        if (capacity !== undefined) machine.capacity = capacity;
        if (location !== undefined) machine.location = location;
        if (status) machine.status = status;
        if (installDate) machine.installDate = installDate;
        if (lastMaintenance) machine.lastMaintenance = lastMaintenance;
        if (notes !== undefined) machine.notes = notes;
        await machine.save();
        res.json(machine);
    } catch (error) { res.status(400).json({ message: error.message }); }
};

const deleteMachine = async (req, res) => {
    try {
        const machine = await Machine.findById(req.params.id);
        if (!machine) return res.status(404).json({ message: 'Machine not found' });
        await Machine.findByIdAndDelete(req.params.id);
        res.json({ message: 'Machine deleted' });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

module.exports = { getMachines, getMachineById, createMachine, updateMachine, deleteMachine };
