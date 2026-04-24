const express = require('express');
const router = express.Router();
const { Sequelize } = require('sequelize');
const {
  ProductionLog, SafetyIncident, CostAnalysis,
  Equipment, EnvironmentalCompliance, MaintenanceSchedule
} = require('../models');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

// GET /production - production report
router.get('/production', async (req, res) => {
  try {
    const logs = await ProductionLog.findAll({ raw: true });

    const totalTonnage = logs.reduce((sum, log) => sum + (parseFloat(log.tonnage) || 0), 0);
    const totalOperatingHours = logs.reduce((sum, log) => sum + (parseFloat(log.operatingHours) || 0), 0);
    const averageEfficiency = logs.length > 0
      ? logs.reduce((sum, log) => sum + (parseFloat(log.efficiency) || 0), 0) / logs.length
      : 0;

    res.json({
      totalLogs: logs.length,
      totalTonnage,
      averageEfficiency: Math.round(averageEfficiency * 100) / 100,
      totalOperatingHours,
      recentLogs: logs.slice(0, 10)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /safety - safety report
router.get('/safety', async (req, res) => {
  try {
    const incidents = await SafetyIncident.findAll({ raw: true });

    const bySeverity = {};
    const byType = {};
    const byLocation = {};

    incidents.forEach(incident => {
      const severity = incident.severity || 'unknown';
      bySeverity[severity] = (bySeverity[severity] || 0) + 1;

      const type = incident.type || 'unknown';
      byType[type] = (byType[type] || 0) + 1;

      const location = incident.location || 'unknown';
      byLocation[location] = (byLocation[location] || 0) + 1;
    });

    const recentIncidents = await SafetyIncident.findAll({
      order: [['createdAt', 'DESC']],
      limit: 10
    });

    res.json({
      totalIncidents: incidents.length,
      bySeverity,
      byType,
      byLocation,
      recentIncidents
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /cost - cost report
router.get('/cost', async (req, res) => {
  try {
    const costs = await CostAnalysis.findAll({ raw: true });

    const byCategory = {};
    let totalBudget = 0;
    let totalActual = 0;

    costs.forEach(cost => {
      const category = cost.category || 'unknown';
      if (!byCategory[category]) {
        byCategory[category] = { totalCost: 0, count: 0 };
      }
      byCategory[category].totalCost += parseFloat(cost.actualCost) || 0;
      byCategory[category].count += 1;

      totalBudget += parseFloat(cost.budgetedCost) || 0;
      totalActual += parseFloat(cost.actualCost) || 0;
    });

    res.json({
      totalRecords: costs.length,
      totalBudget,
      totalActual,
      budgetVariance: totalBudget - totalActual,
      byCategory
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /equipment - equipment report
router.get('/equipment', async (req, res) => {
  try {
    const equipment = await Equipment.findAll({ raw: true });
    const maintenance = await MaintenanceSchedule.findAll({ raw: true });

    const byStatus = {};
    let totalUtilization = 0;

    equipment.forEach(item => {
      const status = item.status || 'unknown';
      byStatus[status] = (byStatus[status] || 0) + 1;
      totalUtilization += parseFloat(item.utilizationRate) || 0;
    });

    const averageUtilization = equipment.length > 0
      ? Math.round((totalUtilization / equipment.length) * 100) / 100
      : 0;

    const totalMaintenanceCost = maintenance.reduce(
      (sum, m) => sum + (parseFloat(m.cost) || 0), 0
    );

    res.json({
      totalEquipment: equipment.length,
      byStatus,
      averageUtilization,
      totalMaintenanceCost,
      pendingMaintenance: maintenance.filter(m => m.status === 'pending').length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /environmental - environmental report
router.get('/environmental', async (req, res) => {
  try {
    const records = await EnvironmentalCompliance.findAll({ raw: true });

    let compliantCount = 0;
    let violationCount = 0;

    records.forEach(record => {
      if (record.status === 'compliant' || record.compliant === true) {
        compliantCount++;
      } else {
        violationCount++;
      }
    });

    const complianceRate = records.length > 0
      ? Math.round((compliantCount / records.length) * 100 * 100) / 100
      : 0;

    res.json({
      totalRecords: records.length,
      compliantCount,
      violationCount,
      complianceRate,
      recentRecords: records.slice(-10)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
