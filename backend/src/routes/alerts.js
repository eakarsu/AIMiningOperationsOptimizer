const express = require('express');
const router = express.Router();
const { Alert } = require('../models');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

// GET / - list all alerts with optional filters
router.get('/', async (req, res) => {
  try {
    const { type, severity, status } = req.query;
    const where = {};

    if (type) where.type = type;
    if (severity) where.severity = severity;
    if (status) where.status = status;

    const alerts = await Alert.findAll({ where, order: [['createdAt', 'DESC']] });
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /:id - single alert
router.get('/:id', async (req, res) => {
  try {
    const alert = await Alert.findByPk(req.params.id);
    if (!alert) return res.status(404).json({ error: 'Alert not found' });
    res.json(alert);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST / - create new alert
router.post('/', async (req, res) => {
  try {
    const alert = await Alert.create(req.body);
    res.status(201).json(alert);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /:id - update alert
router.put('/:id', async (req, res) => {
  try {
    const alert = await Alert.findByPk(req.params.id);
    if (!alert) return res.status(404).json({ error: 'Alert not found' });

    await alert.update(req.body);
    res.json(alert);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /:id - delete alert
router.delete('/:id', async (req, res) => {
  try {
    const alert = await Alert.findByPk(req.params.id);
    if (!alert) return res.status(404).json({ error: 'Alert not found' });

    await alert.destroy();
    res.json({ message: 'Alert deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /:id/acknowledge - acknowledge alert
router.put('/:id/acknowledge', async (req, res) => {
  try {
    const alert = await Alert.findByPk(req.params.id);
    if (!alert) return res.status(404).json({ error: 'Alert not found' });

    await alert.update({
      acknowledgedBy: req.user.name,
      acknowledgedAt: new Date(),
      status: 'acknowledged'
    });
    res.json(alert);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /:id/resolve - resolve alert
router.put('/:id/resolve', async (req, res) => {
  try {
    const alert = await Alert.findByPk(req.params.id);
    if (!alert) return res.status(404).json({ error: 'Alert not found' });

    await alert.update({
      resolvedAt: new Date(),
      status: 'resolved'
    });
    res.json(alert);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
