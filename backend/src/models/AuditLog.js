const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AuditLog = sequelize.define('AuditLog', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  userName: { type: DataTypes.STRING, allowNull: false },
  action: { type: DataTypes.STRING, allowNull: false },
  resource: { type: DataTypes.STRING, allowNull: false },
  resourceId: { type: DataTypes.INTEGER, allowNull: true },
  details: { type: DataTypes.JSONB, defaultValue: null },
  ipAddress: { type: DataTypes.STRING, allowNull: true }
}, { tableName: 'audit_logs', timestamps: true });

module.exports = AuditLog;
