const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DrillPattern = sequelize.define('DrillPattern', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  patternId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  blastZone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  holeCount: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  holeDepth: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  holeDiameter: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  spacing: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  burden: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  rockType: {
    type: DataTypes.STRING,
    allowNull: false
  },
  explosiveType: {
    type: DataTypes.STRING,
    allowNull: false
  },
  explosiveAmount: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'planned'
  },
  aiOptimization: {
    type: DataTypes.JSONB,
    defaultValue: null
  }
}, {
  tableName: 'drill_patterns',
  timestamps: true
});

module.exports = DrillPattern;
