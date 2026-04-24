const express = require('express');
const router = express.Router();
const { ShiftSchedule } = require('../models');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

// GET / - list all shift schedules with optional filters
router.get('/', async (req, res) => {
  try {
    const { date, shift, workerId, status } = req.query;
    const where = {};

    if (date) where.date = date;
    if (shift) where.shift = shift;
    if (workerId) where.workerId = workerId;
    if (status) where.status = status;

    const schedules = await ShiftSchedule.findAll({ where, order: [['createdAt', 'DESC']] });
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /:id - single schedule
router.get('/:id', async (req, res) => {
  try {
    const schedule = await ShiftSchedule.findByPk(req.params.id);
    if (!schedule) return res.status(404).json({ error: 'Shift schedule not found' });
    res.json(schedule);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST / - create
router.post('/', async (req, res) => {
  try {
    const schedule = await ShiftSchedule.create(req.body);
    res.status(201).json(schedule);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /:id - update
router.put('/:id', async (req, res) => {
  try {
    const schedule = await ShiftSchedule.findByPk(req.params.id);
    if (!schedule) return res.status(404).json({ error: 'Shift schedule not found' });

    await schedule.update(req.body);
    res.json(schedule);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /:id - delete
router.delete('/:id', async (req, res) => {
  try {
    const schedule = await ShiftSchedule.findByPk(req.params.id);
    if (!schedule) return res.status(404).json({ error: 'Shift schedule not found' });

    await schedule.destroy();
    res.json({ message: 'Shift schedule deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
