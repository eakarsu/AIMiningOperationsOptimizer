const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const EnvironmentalCompliance = sequelize.define('EnvironmentalCompliance', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  reportId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false
  },
  parameter: {
    type: DataTypes.STRING,
    allowNull: false
  },
  measuredValue: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  unit: {
    type: DataTypes.STRING,
    allowNull: false
  },
  regulatoryLimit: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false
  },
  monitoringDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  complianceStatus: {
    type: DataTypes.STRING,
    defaultValue: 'compliant'
  },
  inspector: {
    type: DataTypes.STRING,
    allowNull: false
  },
  notes: {
    type: DataTypes.TEXT,
    defaultValue: null
  },
  aiAssessment: {
    type: DataTypes.JSONB,
    defaultValue: null
  }
}, {
  tableName: 'environmental_compliance',
  timestamps: true
});

module.exports = EnvironmentalCompliance;
