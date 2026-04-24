const express = require('express');
const router = express.Router();
const { MaintenanceSchedule } = require('../models');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

// GET / - list all maintenance schedules with optional filters
router.get('/', async (req, res) => {
  try {
    const { status, priority, equipmentId } = req.query;
    const where = {};

    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (equipmentId) where.equipmentId = equipmentId;

    const schedules = await MaintenanceSchedule.findAll({ where, order: [['createdAt', 'DESC']] });
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /:id - single
router.get('/:id', async (req, res) => {
  try {
    const schedule = await MaintenanceSchedule.findByPk(req.params.id);
    if (!schedule) return res.status(404).json({ error: 'Maintenance schedule not found' });
    res.json(schedule);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST / - create
router.post('/', async (req, res) => {
  try {
    const schedule = await MaintenanceSchedule.create(req.body);
    res.status(201).json(schedule);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /:id - update
router.put('/:id', async (req, res) => {
  try {
    const schedule = await MaintenanceSchedule.findByPk(req.params.id);
    if (!schedule) return res.status(404).json({ error: 'Maintenance schedule not found' });

    await schedule.update(req.body);
    res.json(schedule);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /:id - delete
router.delete('/:id', async (req, res) => {
  try {
    const schedule = await MaintenanceSchedule.findByPk(req.params.id);
    if (!schedule) return res.status(404).json({ error: 'Maintenance schedule not found' });

    await schedule.destroy();
    res.json({ message: 'Maintenance schedule deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
