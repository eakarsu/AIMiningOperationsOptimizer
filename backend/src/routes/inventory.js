const express = require('express');
const router = express.Router();
const { InventoryItem } = require('../models');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

// GET / - list all inventory items with optional filters
router.get('/', async (req, res) => {
  try {
    const { category, status, location } = req.query;
    const where = {};

    if (category) where.category = category;
    if (status) where.status = status;
    if (location) where.location = location;

    const items = await InventoryItem.findAll({ where, order: [['createdAt', 'DESC']] });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /:id - single
router.get('/:id', async (req, res) => {
  try {
    const item = await InventoryItem.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Inventory item not found' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST / - create
router.post('/', async (req, res) => {
  try {
    const item = await InventoryItem.create(req.body);
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /:id - update
router.put('/:id', async (req, res) => {
  try {
    const item = await InventoryItem.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Inventory item not found' });

    await item.update(req.body);
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /:id - delete
router.delete('/:id', async (req, res) => {
  try {
    const item = await InventoryItem.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Inventory item not found' });

    await item.destroy();
    res.json({ message: 'Inventory item deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /:id/restock - restock item
router.put('/:id/restock', async (req, res) => {
  try {
    const item = await InventoryItem.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Inventory item not found' });

    const addQuantity = parseInt(req.body.quantity, 10);
    if (isNaN(addQuantity) || addQuantity <= 0) {
      return res.status(400).json({ error: 'Valid positive quantity is required' });
    }

    await item.update({
      quantity: (item.quantity || 0) + addQuantity,
      lastRestocked: new Date()
    });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
