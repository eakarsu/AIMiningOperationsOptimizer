const express = require('express');
const router = express.Router();
const { Sequelize, Op } = require('sequelize');
const {
  OreGrade, DrillPattern, SafetyIncident, Equipment,
  EnvironmentalCompliance, ProductionLog, WorkforceRecord,
  CostAnalysis, GeologyMap, HaulingLogistic, Alert,
  MaintenanceSchedule, InventoryItem, ShiftSchedule
} = require('../models');
const { authenticateToken } = require('../middleware/auth');
const { generateYieldForecast } = require('../services/yieldForecastService');
const { analyzeCorrelations } = require('../services/aiService');

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

// GET /yield-forecast - AI-predicted ore grades and yields for next 30 days
// Uses recent ore grade samples + active drill patterns as context for the prediction.
router.get('/yield-forecast', async (req, res) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Fetch context data in parallel
    const [oreGrades, drillPatterns] = await Promise.all([
      OreGrade.findAll({
        where: { createdAt: { [Op.gte]: thirtyDaysAgo } },
        order: [['createdAt', 'DESC']],
        limit: 200,
      }),
      DrillPattern.findAll({
        order: [['createdAt', 'DESC']],
        limit: 50,
      }),
    ]);

    if (oreGrades.length === 0) {
      return res.status(400).json({
        error: 'Insufficient data',
        message: 'No ore grade samples found in the last 30 days. Add ore grade data to generate a forecast.',
      });
    }

    const forecast = await generateYieldForecast(
      oreGrades.map(g => g.toJSON()),
      drillPatterns.map(p => p.toJSON()),
    );

    res.json({
      period: {
        from: new Date().toISOString(),
        to: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        days: 30,
      },
      inputSummary: {
        oreGradeSamples: oreGrades.length,
        drillPatterns: drillPatterns.length,
        zones: [...new Set(oreGrades.map(g => g.zone))],
      },
      ...forecast,
    });
  } catch (error) {
    console.error('Yield forecast error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate yield forecast' });
  }
});

// GET /analytics/correlations — AI cross-domain correlation analysis
router.get('/correlations', async (req, res) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [oreGrades, equipmentDowntime, safetyIncidents, workforce] = await Promise.all([
      OreGrade.findAll({ where: { createdAt: { [Op.gte]: thirtyDaysAgo } }, attributes: ['gradePercentage'] }),
      Equipment.count({ where: { status: { [Op.in]: ['maintenance', 'breakdown'] } } }),
      SafetyIncident.count({ where: { createdAt: { [Op.gte]: thirtyDaysAgo } } }),
      WorkforceRecord.findAll({ attributes: ['hoursThisMonth'] }),
    ]);

    const avgOreGrade = oreGrades.length
      ? (oreGrades.reduce((s, g) => s + (g.gradePercentage || 0), 0) / oreGrades.length).toFixed(2)
      : 0;

    const avgFatigueHours = workforce.length
      ? (workforce.reduce((s, w) => s + (w.hoursThisMonth || 0), 0) / workforce.length).toFixed(1)
      : 0;

    const aiResult = await analyzeCorrelations({
      avgOreGrade,
      equipmentDowntime,
      safetyIncidents,
      avgFatigueHours,
    });

    res.json({
      summary: {
        avgOreGrade,
        equipmentDowntime,
        safetyIncidents,
        avgFatigueHours,
        periodDays: 30,
      },
      analysis: aiResult.parsed || aiResult,
    });
  } catch (error) {
    console.error('Correlations error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
