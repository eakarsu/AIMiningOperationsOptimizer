const express = require('express');
const router = express.Router();
const { SafetyIncident, Alert } = require('../models');
const sequelize = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { aiRateLimiter } = require('../middleware/rateLimiter');
const { analyzeSafetyIncident } = require('../services/aiService');
const { validate, rules } = require('../middleware/validate');
const { persistSafetyAlert } = require('../services/safetyAlertService');

router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(req.query.pageSize) || 20));
    const offset = (page - 1) * pageSize;
    const { count, rows } = await SafetyIncident.findAndCountAll({
      order: [['createdAt', 'DESC']],
      limit: pageSize,
      offset,
    });
    res.json({ data: rows, pagination: { page, pageSize, total: count, totalPages: Math.ceil(count / pageSize) } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const item = await SafetyIncident.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', validate(rules.safetyIncident), async (req, res) => {
  try {
    const item = await SafetyIncident.create(req.body);
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const item = await SafetyIncident.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    await item.update(req.body);
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const item = await SafetyIncident.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    await item.destroy();
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/analyze', aiRateLimiter, async (req, res) => {
  try {
    const item = await SafetyIncident.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    const aiResult = await analyzeSafetyIncident(item);
    await item.update({ aiAnalysis: aiResult, status: 'analyzed' });

    // Persist to ai_analyses
    try {
      await sequelize.query(
        `INSERT INTO ai_analyses (entity_type, entity_id, user_id, result) VALUES (:type, :eid, :uid, :result)`,
        { replacements: { type: 'safety_incident', eid: item.id, uid: req.user?.id || null, result: JSON.stringify(aiResult) } }
      );
    } catch (e) { console.error('ai_analyses insert failed:', e.message); }

    // Persist alert + escalate if AI detects high-risk condition
    let alert = null;
    try {
      alert = await persistSafetyAlert(item, aiResult);
    } catch (alertErr) {
      console.error('[safety alert] persist failed:', alertErr.message);
    }

    res.json({ item, aiResult, alert });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
