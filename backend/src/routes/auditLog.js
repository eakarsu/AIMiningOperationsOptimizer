const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { AuditLog } = require('../models');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

// GET / - list all audit logs with optional filters
router.get('/', async (req, res) => {
  try {
    const { userId, action, resource, from, to } = req.query;
    const where = {};

    if (userId) where.userId = userId;
    if (action) where.action = action;
    if (resource) where.resource = resource;
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt[Op.gte] = new Date(from);
      if (to) where.createdAt[Op.lte] = new Date(to);
    }

    const logs = await AuditLog.findAll({ where, order: [['createdAt', 'DESC']] });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /:id - get single log
router.get('/:id', async (req, res) => {
  try {
    const log = await AuditLog.findByPk(req.params.id);
    if (!log) return res.status(404).json({ error: 'Audit log not found' });
    res.json(log);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST / - create new audit log entry
router.post('/', async (req, res) => {
  try {
    const { userId, userName, action, resource, resourceId, details, ipAddress } = req.body;
    const log = await AuditLog.create({ userId, userName, action, resource, resourceId, details, ipAddress });
    res.status(201).json(log);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /:id - delete log (admin only)
router.delete('/:id', async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const log = await AuditLog.findByPk(req.params.id);
    if (!log) return res.status(404).json({ error: 'Audit log not found' });

    await log.destroy();
    res.json({ message: 'Audit log deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
