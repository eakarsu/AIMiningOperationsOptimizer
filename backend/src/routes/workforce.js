const express = require('express');
const router = express.Router();
const { WorkforceRecord } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const { analyzeWorkforce } = require('../services/aiService');

router.use(authenticateToken);

router.get('/', async (req, res) => {
  try { const items = await WorkforceRecord.findAll({ order: [['createdAt', 'DESC']] }); res.json(items); }
  catch (error) { res.status(500).json({ error: error.message }); }
});

router.get('/:id', async (req, res) => {
  try { const item = await WorkforceRecord.findByPk(req.params.id); if (!item) return res.status(404).json({ error: 'Not found' }); res.json(item); }
  catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/', async (req, res) => {
  try { const item = await WorkforceRecord.create(req.body); res.status(201).json(item); }
  catch (error) { res.status(500).json({ error: error.message }); }
});

router.put('/:id', async (req, res) => {
  try { const item = await WorkforceRecord.findByPk(req.params.id); if (!item) return res.status(404).json({ error: 'Not found' }); await item.update(req.body); res.json(item); }
  catch (error) { res.status(500).json({ error: error.message }); }
});

router.delete('/:id', async (req, res) => {
  try { const item = await WorkforceRecord.findByPk(req.params.id); if (!item) return res.status(404).json({ error: 'Not found' }); await item.destroy(); res.json({ message: 'Deleted successfully' }); }
  catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/:id/analyze', async (req, res) => {
  try {
    const item = await WorkforceRecord.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    const aiResult = await analyzeWorkforce(item);
    await item.update({ aiAssessment: aiResult });
    res.json({ item, aiResult });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

module.exports = router;
