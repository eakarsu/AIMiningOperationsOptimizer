const express = require('express');
const router = express.Router();
const {
  Equipment, OreGrade, SafetyIncident, DrillPattern,
  EnvironmentalCompliance, ProductionLog, WorkforceRecord,
  CostAnalysis, GeologyMap, HaulingLogistic, Alert,
  MaintenanceSchedule, InventoryItem, ShiftSchedule
} = require('../models');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

const modelMap = {
  'equipment': Equipment,
  'ore-grades': OreGrade,
  'safety-incidents': SafetyIncident,
  'drill-patterns': DrillPattern,
  'environmental': EnvironmentalCompliance,
  'production-logs': ProductionLog,
  'workforce': WorkforceRecord,
  'cost-analysis': CostAnalysis,
  'geology-maps': GeologyMap,
  'hauling': HaulingLogistic,
  'alerts': Alert,
  'maintenance': MaintenanceSchedule,
  'inventory': InventoryItem,
  'shifts': ShiftSchedule
};

// GET /:resource - export resource data as CSV
router.get('/:resource', async (req, res) => {
  try {
    const { resource } = req.params;
    const Model = modelMap[resource];

    if (!Model) {
      return res.status(400).json({ error: `Invalid resource: ${resource}. Valid resources: ${Object.keys(modelMap).join(', ')}` });
    }

    const records = await Model.findAll({ raw: true });
    if (records.length === 0) {
      return res.status(404).json({ error: 'No data to export' });
    }

    const headers = Object.keys(records[0]);
    const csvRows = [headers.join(',')];
    records.forEach(record => {
      const values = headers.map(h => {
        const val = record[h];
        if (val === null || val === undefined) return '';
        const str = typeof val === 'object' ? JSON.stringify(val) : String(val);
        return `"${str.replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(','));
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${resource}-export.csv"`);
    res.send(csvRows.join('\n'));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
