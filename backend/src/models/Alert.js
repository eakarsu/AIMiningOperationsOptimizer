const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Alert = sequelize.define('Alert', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  alertId: { type: DataTypes.STRING, unique: true, allowNull: false },
  title: { type: DataTypes.STRING, allowNull: false },
  type: { type: DataTypes.STRING, allowNull: false },
  severity: { type: DataTypes.STRING, defaultValue: 'medium' },
  status: { type: DataTypes.STRING, defaultValue: 'active' },
  message: { type: DataTypes.TEXT, allowNull: false },
  source: { type: DataTypes.STRING, allowNull: false },
  threshold: { type: DataTypes.FLOAT, allowNull: true },
  currentValue: { type: DataTypes.FLOAT, allowNull: true },
  acknowledgedBy: { type: DataTypes.STRING, allowNull: true },
  acknowledgedAt: { type: DataTypes.DATE, allowNull: true },
  resolvedAt: { type: DataTypes.DATE, allowNull: true }
}, { tableName: 'alerts', timestamps: true });

module.exports = Alert;
