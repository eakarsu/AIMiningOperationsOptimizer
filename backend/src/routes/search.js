const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const {
  Equipment, OreGrade, SafetyIncident, DrillPattern,
  EnvironmentalCompliance, ProductionLog, WorkforceRecord,
  CostAnalysis, GeologyMap, HaulingLogistic, Alert,
  MaintenanceSchedule, InventoryItem, ShiftSchedule
} = require('../models');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

const resourceModelMap = {
  equipment: Equipment,
  'ore-grades': OreGrade,
  'safety-incidents': SafetyIncident,
  'drill-patterns': DrillPattern,
  environmental: EnvironmentalCompliance,
  'production-logs': ProductionLog,
  workforce: WorkforceRecord,
  'cost-analysis': CostAnalysis,
  'geology-maps': GeologyMap,
  hauling: HaulingLogistic,
  alerts: Alert,
  maintenance: MaintenanceSchedule,
  inventory: InventoryItem,
  shifts: ShiftSchedule
};

async function searchModel(Model, searchTerm) {
  const attributes = Object.entries(Model.rawAttributes)
    .filter(([, attr]) => {
      const type = attr.type.constructor.name || attr.type.key;
      return ['STRING', 'TEXT'].includes(type);
    })
    .map(([name]) => name);

  if (attributes.length === 0) return [];

  const whereConditions = attributes.map(attr => ({
    [attr]: { [Op.like]: `%${searchTerm}%` }
  }));

  const results = await Model.findAll({
    where: { [Op.or]: whereConditions },
    limit: 10
  });

  return results;
}

// GET / - global search
router.get('/', async (req, res) => {
  try {
    const { q, resource } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({ error: 'Search query parameter "q" is required' });
    }

    const results = {};

    if (resource && resourceModelMap[resource]) {
      const Model = resourceModelMap[resource];
      results[resource] = await searchModel(Model, q);
    } else {
      const searchPromises = Object.entries(resourceModelMap).map(async ([name, Model]) => {
        try {
          const modelResults = await searchModel(Model, q);
          if (modelResults.length > 0) {
            results[name] = modelResults;
          }
        } catch (err) {
          // Skip models that fail to search
        }
      });

      await Promise.all(searchPromises);
    }

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
