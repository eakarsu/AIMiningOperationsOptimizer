const express = require('express');
const router = express.Router();
const { DrillPattern } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const sequelize = require('../config/database');
const { aiRateLimiter } = require('../middleware/rateLimiter');
const { optimizeDrillPattern } = require('../services/aiService');
const { validate, rules } = require('../middleware/validate');

router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(req.query.pageSize) || 20));
    const { count, rows } = await DrillPattern.findAndCountAll({
      order: [['createdAt', 'DESC']],
      limit: pageSize,
      offset: (page - 1) * pageSize,
    });
    res.json({ data: rows, pagination: { page, pageSize, total: count, totalPages: Math.ceil(count / pageSize) } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const item = await DrillPattern.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', validate(rules.drillPattern), async (req, res) => {
  try {
    const item = await DrillPattern.create(req.body);
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const item = await DrillPattern.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    await item.update(req.body);
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const item = await DrillPattern.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    await item.destroy();
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/optimize', aiRateLimiter, async (req, res) => {
  try {
    const item = await DrillPattern.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    const aiResult = await optimizeDrillPattern(item);
    await item.update({ aiOptimization: aiResult, status: 'optimized' });
    try { await sequelize.query(`INSERT INTO ai_analyses (entity_type, entity_id, user_id, result) VALUES (:t,:e,:u,:r)`, { replacements: { t: 'drill_pattern', e: item.id, u: req.user?.id || null, r: JSON.stringify(aiResult) } }); } catch {}
    res.json({ item, aiResult });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
