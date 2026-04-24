const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProductionLog = sequelize.define('ProductionLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  logId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  shift: {
    type: DataTypes.STRING,
    allowNull: false
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  zone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  materialType: {
    type: DataTypes.STRING,
    allowNull: false
  },
  tonnageMined: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  tonnageProcessed: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  recoveryRate: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  downtime: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  operatorCount: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  supervisor: {
    type: DataTypes.STRING,
    allowNull: false
  },
  notes: {
    type: DataTypes.TEXT,
    defaultValue: null
  },
  aiAnalysis: {
    type: DataTypes.JSONB,
    defaultValue: null
  }
}, {
  tableName: 'production_logs',
  timestamps: true
});

module.exports = ProductionLog;
