const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const WorkforceRecord = sequelize.define('WorkforceRecord', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  workerId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false
  },
  department: {
    type: DataTypes.STRING,
    allowNull: false
  },
  shift: {
    type: DataTypes.STRING,
    allowNull: false
  },
  certification: {
    type: DataTypes.STRING,
    allowNull: false
  },
  certExpiry: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  yearsExperience: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  safetyScore: {
    type: DataTypes.FLOAT,
    defaultValue: 100
  },
  hoursThisMonth: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'active'
  },
  aiAssessment: {
    type: DataTypes.JSONB,
    defaultValue: null
  }
}, {
  tableName: 'workforce_records',
  timestamps: true
});

module.exports = WorkforceRecord;
