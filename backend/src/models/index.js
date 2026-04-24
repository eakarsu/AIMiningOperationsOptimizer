const sequelize = require('../config/database');
const User = require('./User');
const OreGrade = require('./OreGrade');
const DrillPattern = require('./DrillPattern');
const SafetyIncident = require('./SafetyIncident');
const Equipment = require('./Equipment');
const EnvironmentalCompliance = require('./EnvironmentalCompliance');
const ProductionLog = require('./ProductionLog');
const WorkforceRecord = require('./WorkforceRecord');
const CostAnalysis = require('./CostAnalysis');
const GeologyMap = require('./GeologyMap');
const HaulingLogistic = require('./HaulingLogistic');
const AuditLog = require('./AuditLog');
const Alert = require('./Alert');
const ShiftSchedule = require('./ShiftSchedule');
const MaintenanceSchedule = require('./MaintenanceSchedule');
const InventoryItem = require('./InventoryItem');

module.exports = {
  sequelize,
  User,
  OreGrade,
  DrillPattern,
  SafetyIncident,
  Equipment,
  EnvironmentalCompliance,
  ProductionLog,
  WorkforceRecord,
  CostAnalysis,
  GeologyMap,
  HaulingLogistic,
  AuditLog,
  Alert,
  ShiftSchedule,
  MaintenanceSchedule,
  InventoryItem
};
