const express = require('express');
const router = express.Router();
const { Equipment, Alert } = require('../models');
const sequelize = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { aiRateLimiter } = require('../middleware/rateLimiter');
const { analyzeEquipment } = require('../services/aiService');
const { validate, rules } = require('../middleware/validate');

router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(req.query.pageSize) || 20));
    const { count, rows } = await Equipment.findAndCountAll({
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
    const item = await Equipment.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', validate(rules.equipment), async (req, res) => {
  try {
    const item = await Equipment.create(req.body);
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const item = await Equipment.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    await item.update(req.body);
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const item = await Equipment.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    await item.destroy();
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/analyze', aiRateLimiter, async (req, res) => {
  try {
    const item = await Equipment.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    const aiResult = await analyzeEquipment(item);
    await item.update({ aiRecommendation: aiResult, status: 'analyzed' });

    // Persist to ai_analyses
    try {
      await sequelize.query(
        `INSERT INTO ai_analyses (entity_type, entity_id, user_id, result) VALUES (:type, :eid, :uid, :result)`,
        { replacements: { type: 'equipment', eid: item.id, uid: req.user?.id || null, result: JSON.stringify(aiResult) } }
      );
    } catch (e) { console.error('ai_analyses insert failed:', e.message); }

    res.json({ item, aiResult });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Auto-check all equipment — POST /equipment/auto-alerts
router.post('/auto-alerts', async (req, res) => {
  try {
    const allEquipment = await Equipment.findAll();
    let checked = 0;
    let alertsCreated = 0;

    for (const equip of allEquipment) {
      checked++;
      // Use stored AI analysis if it's recent (< 24h), otherwise re-analyze
      let analysis = equip.aiRecommendation;
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      if (!analysis || new Date(equip.updatedAt) < oneDayAgo) {
        try {
          const aiResult = await analyzeEquipment(equip);
          await equip.update({ aiRecommendation: aiResult, status: 'analyzed' });
          analysis = aiResult;
        } catch (e) {
          console.error(`AI analyze failed for equipment ${equip.id}:`, e.message);
          continue;
        }
      }

      // Parse health_score from ai result
      const parsed = analysis?.parsed || analysis;
      const healthScore = parsed?.health_score || parsed?.content?.health_score || null;

      if (healthScore !== null && healthScore < 40) {
        try {
          await Alert.create({
            alertId: `AUTO-${equip.equipmentId}-${Date.now()}`,
            type: 'maintenance',
            severity: healthScore < 20 ? 'critical' : 'high',
            message: `Equipment ${equip.name} has health score ${healthScore}/100 — immediate maintenance required`,
            entityType: 'equipment',
            entityId: equip.id,
            status: 'active',
            location: equip.location || 'Unknown'
          });
          alertsCreated++;
        } catch (e) {
          console.error(`Alert create failed for equipment ${equip.id}:`, e.message);
        }
      }
    }

    res.json({ checked, alerts_created: alertsCreated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
