const express = require('express');
const router = express.Router();
const { EnvironmentalCompliance } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const sequelize = require('../config/database');
const { aiRateLimiter } = require('../middleware/rateLimiter');
const { assessEnvironmentalCompliance } = require('../services/aiService');

router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const items = await EnvironmentalCompliance.findAll({ order: [['createdAt', 'DESC']] });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const item = await EnvironmentalCompliance.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const item = await EnvironmentalCompliance.create(req.body);
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const item = await EnvironmentalCompliance.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    await item.update(req.body);
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const item = await EnvironmentalCompliance.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    await item.destroy();
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/assess', aiRateLimiter, async (req, res) => {
  try {
    const item = await EnvironmentalCompliance.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    const aiResult = await assessEnvironmentalCompliance(item);
    await item.update({ aiAssessment: aiResult, complianceStatus: 'assessed' });
    try { await sequelize.query(`INSERT INTO ai_analyses (entity_type, entity_id, user_id, result) VALUES (:t,:e,:u,:r)`, { replacements: { t: 'environmental', e: item.id, u: req.user?.id || null, r: JSON.stringify(aiResult) } }); } catch {}
    res.json({ item, aiResult });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
