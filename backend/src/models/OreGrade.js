const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const OreGrade = sequelize.define('OreGrade', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  sampleId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false
  },
  zone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  depth: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  mineralType: {
    type: DataTypes.STRING,
    allowNull: false
  },
  gradePercentage: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  tonnage: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  confidence: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'pending'
  },
  aiPrediction: {
    type: DataTypes.JSONB,
    defaultValue: null
  }
}, {
  tableName: 'ore_grades',
  timestamps: true
});

module.exports = OreGrade;
