const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SafetyIncident = sequelize.define('SafetyIncident', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  incidentId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  severity: {
    type: DataTypes.STRING,
    allowNull: false
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false
  },
  zone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  reportedBy: {
    type: DataTypes.STRING,
    allowNull: false
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'open'
  },
  injuriesCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  rootCause: {
    type: DataTypes.TEXT,
    defaultValue: null
  },
  correctiveAction: {
    type: DataTypes.TEXT,
    defaultValue: null
  },
  aiAnalysis: {
    type: DataTypes.JSONB,
    defaultValue: null
  }
}, {
  tableName: 'safety_incidents',
  timestamps: true
});

module.exports = SafetyIncident;
