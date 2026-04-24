const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MaintenanceSchedule = sequelize.define('MaintenanceSchedule', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  scheduleId: { type: DataTypes.STRING, unique: true, allowNull: false },
  equipmentId: { type: DataTypes.STRING, allowNull: false },
  equipmentName: { type: DataTypes.STRING, allowNull: false },
  type: { type: DataTypes.STRING, allowNull: false },
  priority: { type: DataTypes.STRING, defaultValue: 'medium' },
  status: { type: DataTypes.STRING, defaultValue: 'scheduled' },
  scheduledDate: { type: DataTypes.DATE, allowNull: false },
  completedDate: { type: DataTypes.DATE, allowNull: true },
  assignedTo: { type: DataTypes.STRING, allowNull: true },
  description: { type: DataTypes.TEXT, allowNull: false },
  estimatedDuration: { type: DataTypes.FLOAT, allowNull: true },
  actualDuration: { type: DataTypes.FLOAT, allowNull: true },
  cost: { type: DataTypes.FLOAT, allowNull: true },
  parts: { type: DataTypes.JSONB, defaultValue: [] },
  notes: { type: DataTypes.TEXT, allowNull: true }
}, { tableName: 'maintenance_schedules', timestamps: true });

module.exports = MaintenanceSchedule;
