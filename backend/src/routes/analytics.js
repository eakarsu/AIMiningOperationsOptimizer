const express = require('express');
const router = express.Router();
const { Sequelize } = require('sequelize');
const {
  OreGrade, DrillPattern, SafetyIncident, Equipment,
  EnvironmentalCompliance, ProductionLog, WorkforceRecord,
  CostAnalysis, GeologyMap, HaulingLogistic, Alert,
  MaintenanceSchedule, InventoryItem, ShiftSchedule
} = require('../models');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

// GET /overview - counts from all models
router.get('/overview', async (req, res) => {
  try {
    const [
      oreGrades, drillPatterns, safetyIncidents, equipment,
      environmental, productionLogs, workforce, costAnalysis,
      geologyMaps, hauling, alerts, maintenance, inventory, shifts
    ] = await Promise.all([
      OreGrade.count(),
      DrillPattern.count(),
      SafetyIncident.count(),
      Equipment.count(),
      EnvironmentalCompliance.count(),
      ProductionLog.count(),
      WorkforceRecord.count(),
      CostAnalysis.count(),
      GeologyMap.count(),
      HaulingLogistic.count(),
      Alert.count(),
      MaintenanceSchedule.count(),
      InventoryItem.count(),
      ShiftSchedule.count()
    ]);

    res.json({
      oreGrades, drillPatterns, safetyIncidents, equipment,
      environmental, productionLogs, workforce, costAnalysis,
      geologyMaps, hauling, alerts, maintenance, inventory, shifts
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /safety-summary - safety incidents grouped by severity
router.get('/safety-summary', async (req, res) => {
  try {
    const incidents = await SafetyIncident.findAll({
      attributes: ['severity', [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']],
      group: ['severity']
    });
    res.json(incidents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /equipment-status - equipment grouped by status
router.get('/equipment-status', async (req, res) => {
  try {
    const equipment = await Equipment.findAll({
      attributes: ['status', [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']],
      group: ['status']
    });
    res.json(equipment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /production-summary - production logs with total tonnage
router.get('/production-summary', async (req, res) => {
  try {
    const summary = await ProductionLog.findAll({
      attributes: [
        [Sequelize.fn('SUM', Sequelize.col('tonnage')), 'totalTonnage'],
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'totalLogs']
      ]
    });
    res.json(summary[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /alerts-summary - active alerts count by severity
router.get('/alerts-summary', async (req, res) => {
  try {
    const alerts = await Alert.findAll({
      attributes: ['severity', [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']],
      where: { status: 'active' },
      group: ['severity']
    });
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
