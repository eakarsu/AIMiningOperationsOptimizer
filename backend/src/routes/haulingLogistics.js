const express = require('express');
const router = express.Router();
const { HaulingLogistic } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const sequelize = require('../config/database');
const { aiRateLimiter } = require('../middleware/rateLimiter');
const { optimizeHauling } = require('../services/aiService');

router.use(authenticateToken);

router.get('/', async (req, res) => {
  try { const items = await HaulingLogistic.findAll({ order: [['createdAt', 'DESC']] }); res.json(items); }
  catch (error) { res.status(500).json({ error: error.message }); }
});

router.get('/:id', async (req, res) => {
  try { const item = await HaulingLogistic.findByPk(req.params.id); if (!item) return res.status(404).json({ error: 'Not found' }); res.json(item); }
  catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/', async (req, res) => {
  try { const item = await HaulingLogistic.create(req.body); res.status(201).json(item); }
  catch (error) { res.status(500).json({ error: error.message }); }
});

router.put('/:id', async (req, res) => {
  try { const item = await HaulingLogistic.findByPk(req.params.id); if (!item) return res.status(404).json({ error: 'Not found' }); await item.update(req.body); res.json(item); }
  catch (error) { res.status(500).json({ error: error.message }); }
});

router.delete('/:id', async (req, res) => {
  try { const item = await HaulingLogistic.findByPk(req.params.id); if (!item) return res.status(404).json({ error: 'Not found' }); await item.destroy(); res.json({ message: 'Deleted successfully' }); }
  catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/:id/optimize', aiRateLimiter, async (req, res) => {
  try {
    const item = await HaulingLogistic.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    const aiResult = await optimizeHauling(item);
    await item.update({ aiOptimization: aiResult, status: 'optimized' });
    try { await sequelize.query(`INSERT INTO ai_analyses (entity_type, entity_id, user_id, result) VALUES (:t,:e,:u,:r)`, { replacements: { t: 'hauling', e: item.id, u: req.user?.id || null, r: JSON.stringify(aiResult) } }); } catch {}
    res.json({ item, aiResult });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

module.exports = router;
