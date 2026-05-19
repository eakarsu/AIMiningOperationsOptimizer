const express = require('express');
const router = express.Router();
const { OreGrade } = require('../models');
const sequelize = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { aiRateLimiter } = require('../middleware/rateLimiter');
const { predictOreGrade } = require('../services/aiService');
const { validate, rules } = require('../middleware/validate');

router.use(authenticateToken);

// Get all (paginated)
router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(req.query.pageSize) || 20));
    const offset = (page - 1) * pageSize;
    const { count, rows } = await OreGrade.findAndCountAll({
      order: [['createdAt', 'DESC']],
      limit: pageSize,
      offset,
    });
    res.json({ data: rows, pagination: { page, pageSize, total: count, totalPages: Math.ceil(count / pageSize) } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get by id
router.get('/:id', async (req, res) => {
  try {
    const item = await OreGrade.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create
router.post('/', validate(rules.oreGrade), async (req, res) => {
  try {
    const item = await OreGrade.create(req.body);
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update
router.put('/:id', async (req, res) => {
  try {
    const item = await OreGrade.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    await item.update(req.body);
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete
router.delete('/:id', async (req, res) => {
  try {
    const item = await OreGrade.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    await item.destroy();
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// AI Predict
router.post('/:id/predict', aiRateLimiter, async (req, res) => {
  try {
    const item = await OreGrade.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    const aiResult = await predictOreGrade(item);
    await item.update({ aiPrediction: aiResult, status: 'analyzed' });

    // Persist to ai_analyses
    try {
      await sequelize.query(
        `INSERT INTO ai_analyses (entity_type, entity_id, user_id, result) VALUES (:type, :eid, :uid, :result)`,
        { replacements: { type: 'ore_grade', eid: item.id, uid: req.user?.id || null, result: JSON.stringify(aiResult) } }
      );
    } catch (e) { console.error('ai_analyses insert failed:', e.message); }

    res.json({ item, aiResult });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
